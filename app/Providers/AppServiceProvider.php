<?php

namespace App\Providers;

use App\Models\Client;
use App\Models\Invoice;
use App\Models\Offer;
use App\Models\Project;
use App\Repositories\InvoiceRepository;
use App\Repositories\OfferRepository;
use App\Repositories\ProjectRepository;
use App\Repositories\SettingsRepository;
use App\Repositories\TimeEntryRepository;
use App\Services\ChartService;
use App\Services\ConfigurationService;
use App\Services\InvoiceService;
use App\Services\OfferService;
use App\Services\ProjectService;
use App\Services\SettingsService;
use App\Services\TimeEntryService;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Route::resourceVerbs([
            'create' => 'neu',
            'edit' => 'bearbeiten',
        ]);

        $this->bindRoute();

        $this->registerServices();
        $this->registerRepositories();
    }

    private function bindRoute(): void
    {
        Route::bind('client', fn($value) => Client::whereUserId(auth()->user()->id)->withTrashed()->findOrFail($value));
        Route::bind('project', fn($value) => Project::withTrashed()->findOrFail($value));
        Route::bind('invoice', fn($value) => Invoice::withTrashed()->findOrFail($value));
        Route::bind('offer', fn($value) => Offer::withTrashed()->findOrFail($value));
    }

    private function registerServices(): void
    {
        $this->app->singleton(ProjectService::class, fn(Application $application) =>
            new ProjectService($application->make(ProjectRepository::class))
        );
        $this->app->singleton(TimeEntryService::class, fn (Application $application) =>
            new TimeEntryService($application->make(TimeEntryRepository::class))
        );
        $this->app->singleton(InvoiceService::class, fn (Application $application) =>
            new InvoiceService($application->make(InvoiceRepository::class))
        );

        $this->app->singleton(ConfigurationService::class);
        $this->app->singleton(ChartService::class);
        $this->app->singleton(SettingsService::class, fn (Application $app) =>
            new SettingsService($app->make(SettingsRepository::class))
        );
        $this->app->singleton(OfferService::class, fn (Application $app) =>
            new OfferService($app->make(OfferRepository::class))
        );
    }

    private function registerRepositories(): void
    {
        $this->app->singleton(ProjectRepository::class, fn() => new ProjectRepository());
        $this->app->singleton(TimeEntryRepository::class, fn () => new TimeEntryRepository());
        $this->app->singleton(InvoiceRepository::class, fn () => new InvoiceRepository());
        $this->app->singleton(SettingsRepository::class);
        $this->app->singleton(OfferRepository::class);
    }
}
