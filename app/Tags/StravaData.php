<?php

namespace App\Tags;

use Statamic\Facades\Entry;
use Statamic\Tags\Tags;

class StravaData extends Tags
{
    /**
     * The {{ strava_data }} tag.
     *
     * @return string|array
     */
    public function index()
    {
        $runs = Entry::query()->where('collection', 'runs')->get();

        // find the top5 distance all time, year, and month
        $top5AllTime = $runs->sortByDesc('distance')->limit(5)->toArray();
        $top5Year = $runs->where('date', '>=', now()->modify('-1 year'))->sortByDesc('distance')->limit(5)->toArray();
        $top5Month = $runs->where('date', '>=', now()->modify('-1 month'))->sortByDesc('distance')->limit(5)->toArray();
        $lastRun = $runs->sortByDesc('date')->first();

        $totalDistance = $runs->sum('distance') / 1000;
        $totalDistanceMonth = $runs->where('date', '>=', now()->modify('-1 month'))->sum('distance') / 1000;

        return [
            'top' => [
                ['title' => 'All Time', 'value' => 'all', 'runs' => $top5AllTime],
                ['title' => 'Past Year', 'value' => 'year', 'runs' => $top5Year],
                ['title' => 'Past Month', 'value' => 'month', 'runs' => $top5Month],
            ],
            'last_run' => $lastRun->toArray(),
            'total_distance' => number_format($totalDistance, 1).'km',
            'total_distance_month' => number_format($totalDistanceMonth, 1).'km',
        ];
    }
}
