<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Statamic\Facades\Entry;

class FetchStravaActivities extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:fetch-strava-activities';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch Strava activities (all)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Fetching Strava activities...');

        // All activities will be stored, this should go and add all of the new ones it finds.
        // Strategy = get the max per page (200), check if each one exists, if not, add it.
        // If we come across one that already exists, we can stop.

        $entries = Entry::query()->where('collection', 'runs')->get();

        $page = 1;
        do {
            $activities = strava()->get('athlete/activities', ['per_page' => 200, 'page' => $page])['data'];

            foreach ($activities as $activity) {
                if ($activity['type'] !== 'Run') {
                    continue;
                }

                // Check if the activity exists
                // If it does, stop
                // If it doesn't, add it

                if ($entries->contains('strava_id', $activity['id'])) {
                    $this->info('Activity already exists, stopping...');

                    return;
                }

                $start_coords = $activity['start_latlng'];

                if (! $start_coords || empty($start_coords)) {
                    $locationString = 'Unknown location';
                } else {
                    $location = bdc()->getReverseGeocode([
                        'latitude' => $start_coords[0],
                        'longitude' => $start_coords[1],
                    ]);

                    $locationString = $location['locality'].', '.$location['city'].', '.$location['countryCode'];
                }

                $entry = Entry::make()->collection('runs')->slug($activity['id']);

                $entry->data([
                    'location' => $locationString,
                    'distance' => $activity['distance'],
                    'date' => $activity['start_date'],
                    'timezone' => $activity['timezone'],
                    'moving_time' => $activity['moving_time'],
                    'elapsed_time' => $activity['elapsed_time'],
                    'total_elevation_gain' => $activity['total_elevation_gain'],
                    'strava_id' => $activity['id'],
                ]);

                $entry->save();
            }

            if (count($activities) < 200) {
                break;
            }

            $page++;
        } while (true);

        $this->info('Strava activities fetched!');
    }
}
