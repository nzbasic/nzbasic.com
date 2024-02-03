<?php

namespace App\Services\Strava;

use App\Traits\HasEndpoints;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Statamic\Facades\GlobalSet;

/**
 * A client for the Star Assess API
 */
class StravaApiClient
{
    use HasEndpoints {
        call as parentCall;
    }

    private string $apiUrl;

    private string $apiToken;

    private PendingRequest $client;

    private array $headers = [
        'Content-Type' => 'application/json',
        'Accept' => 'application/json',
    ];

    /**
     * A new instance of the Star Assess API client
     */
    public function __construct()
    {
        $this->apiUrl = config('services.strava.api_url');
        $this->client = Http::withHeaders($this->headers);
    }

    private function refreshToken()
    {
        $set = GlobalSet::findByHandle('strava');
        $variables = $set->inCurrentSite();

        $expiresAt = $variables->get('expires_at');

        // expires at is unix epoch time (milliseconds), check if it expires in less than 1 hour
        if (time() > $expiresAt - 3600) {
            $refreshToken = $variables->get('refresh_token');

            $response = $this->client->post('https://www.strava.com/oauth/token', [
                'client_id' => config('services.strava.client_id'),
                'client_secret' => config('services.strava.client_secret'),
                'grant_type' => 'refresh_token',
                'refresh_token' => $refreshToken,
            ]);

            $body = $response->json();

            $variables->set('expires_at', $body['expires_at']);
            $variables->set('access_token', $body['access_token']);
            $variables->set('refresh_token', $body['refresh_token']);
            $variables->save();

            $this->headers = array_merge($this->headers, [
                'Authorization' => 'Bearer '.$body['access_token'],
            ]);
        } else {
            $this->headers = array_merge($this->headers, [
                'Authorization' => 'Bearer '.$variables->get('access_token'),
            ]);
        }

        $this->client = Http::withHeaders($this->headers);
    }

    public function call(string $method, string $endpoint, array $data = []): mixed
    {
        $this->refreshToken();

        return $this->parentCall($method, $endpoint, $data);
    }
}
