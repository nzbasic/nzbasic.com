<?php

if (! function_exists('strava')) {
    /**
     * An instance of the API client for non-authenticated routes
     */
    function strava()
    {
        return new \App\Services\Strava\StravaApiClient();
    }
}

if (! function_exists('bdc')) {
    /**
     * An instance of the API client for non-authenticated routes
     */
    function bdc()
    {
        return new \BigDataCloud\Api\Client(config('services.bigdatacloud.api_key'));
    }
}

if (! function_exists('cloudflare')) {
    /**
     * An instance of the API client for non-authenticated routes
     */
    function cloudflare()
    {
        return new \App\Services\Cloudflare\CloudflareApiClient();
    }
}
