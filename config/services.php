<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'strava' => [
        'api_url' => env('STRAVA_API_URL', 'https://www.strava.com/api/v3'),
        'client_id' => env('STRAVA_CLIENT_ID'),
        'client_secret' => env('STRAVA_CLIENT_SECRET'),
        'code' => env('STRAVA_CODE'),
    ],

    'bigdatacloud' => [
        'api_key' => env('BIGDATACLOUD_API_KEY'),
    ],

    'cloudflare' => [
        'api_url' => env('CF_API_URL', 'https://api.cloudflare.com/client/v4/graphql'),
        'email' => env('CF_EMAIL'),
        'token' => env('CF_TOKEN'),
        'account_tag' => env('CF_TAG'),
    ],

];
