<?php

namespace App\Services\Cloudflare;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;

/**
 * A client for the Star Assess API
 */
class CloudflareApiClient
{
    private string $apiUrl;

    private PendingRequest $client;

    private array $headers = [];

    /**
     * A new instance of the Star Assess API client
     */
    public function __construct()
    {
        $this->apiUrl = config('services.cloudflare.api_url');

        $this->headers = [
            'X-AUTH-EMAIL' => config('services.cloudflare.email'),
            'X-AUTH-KEY' => config('services.cloudflare.token'),
        ];

        $this->client = Http::withHeaders($this->headers);
    }

    public function getAnalytics()
    {
        $accountTag = config('services.cloudflare.account_tag');
        $filter = [
            'datetime_gt' => now()->subDays(7)->toIsoString(),
        ];

        $query = '
            { viewer {
                accounts(filter: { accountTag: $accountTag }) {
                    httpRequestsOverviewAdaptiveGroups(filter: $filter, limit: 5000) {
                        sum {
                            requests
                            pageViews
                            bytes
                            visits
                        }
                        dimensions {
                            clientCountryName
                            ts: date
                        }
                    }
                }
            }
        }';

        $response = $this->client->post($this->apiUrl, [
            'query' => $query,
            'variables' => [
                'accountTag' => $accountTag,
                'filter' => $filter,
            ],
        ]);

        $data = $response->json()['data'];

        // rewrite above in php

        $requests = 0;
        $pageViews = 0;
        $bytes = 0;
        $visits = 0;

        $map = [];

        foreach ($data['viewer']['accounts'][0]['httpRequestsOverviewAdaptiveGroups'] as $group) {
            $requests += $group['sum']['requests'];
            $pageViews += $group['sum']['pageViews'];
            $bytes += $group['sum']['bytes'];
            $visits += $group['sum']['visits'];

            $country = $group['dimensions']['clientCountryName'];
            $existing = $map[$country] ?? null;
            if ($existing) {
                $existing['requests'] += $group['sum']['requests'];
                $existing['pageViews'] += $group['sum']['pageViews'];
                $existing['bytes'] += $group['sum']['bytes'];
                $existing['visits'] += $group['sum']['visits'];
                $map[$country] = $existing;
            } else {
                $map[$country] = [
                    'country' => $country,
                    'requests' => $group['sum']['requests'],
                    'pageViews' => $group['sum']['pageViews'],
                    'bytes' => $group['sum']['bytes'],
                    'visits' => $group['sum']['visits'],
                ];
            }
        }

        return [
            'requests' => $requests,
            'pageViews' => $pageViews,
            'bytes' => $bytes,
            'visits' => $visits,
            'countries' => array_values($map),
        ];
    }
}
