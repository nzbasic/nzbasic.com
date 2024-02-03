<?php

namespace App\Tags;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Statamic\Tags\Tags;

class GlobeData extends Tags
{
    /**
     * The {{ globe_data }} tag.
     *
     * @return string|array
     */
    public function index()
    {
        $analytics = Cache::remember('users', now()->addHour(), function () {
            $countriesCsv = Storage::disk('local')->get('countries.csv');
            $countryData = collect(explode("\n", $countriesCsv))
                ->map(function ($line) {
                    try {
                        [$id, $abbreviation, $name, $latitude, $longitude] = explode(',', $line);

                        return [
                            'id' => (int) $id,
                            'abbreviation' => $abbreviation,
                            'name' => $name,
                            'latitude' => (float) $latitude,
                            'longitude' => (float) $longitude,
                        ];
                    } catch (\Exception $e) {
                        return null;
                    }
                })->filter(fn ($item) => $item !== null)->splice(1);

            $analytics = cloudflare()->getAnalytics();

            $countries = $countryData->map(function ($country) use ($analytics) {
                $analytics = current(array_filter($analytics['countries'], function ($item) use ($country) {
                    return $item['country'] === $country['abbreviation'];
                }));

                if (! $analytics) {
                    $analytics = [
                        'country' => $country['name'],
                        'requests' => 0,
                        'pageViews' => 0,
                        'bytes' => 0,
                        'visits' => 0,
                    ];
                }

                return [
                    ...$country,
                    ...$analytics,
                ];
            });

            return [
                'total' => [
                    'requests' => $analytics['requests'],
                    'pageViews' => $analytics['pageViews'],
                    'bytes' => $analytics['bytes'],
                    'visits' => $analytics['visits'],
                ],
                'countries' => $countries->toArray(),
            ];
        });

        $topology = Cache::remember('topology', now()->addHours(1), function () {
            $response = Http::get('https://unpkg.com/visionscarto-world-atlas@latest/world/110m.json');

            return $response->json();
        });

        return [
            ...$analytics,
            'topology' => $topology,
        ];
    }
}
