<?php

namespace App\Http\Controllers;

use App\Helpers\Notify;
use App\Http\Requests\StoreBankInformationRequest;
use App\Http\Requests\StoreCompanyInformationRequest;
use App\Http\Requests\StoreCurrencyAndTaxesRequest;
use App\Http\Requests\StorePaymentInformationRequest;
use App\Models\CompanyDetails;
use App\Repositories\SettingsRepository;
use App\Services\ConfigurationService;
use App\Services\SettingsService;
use Inertia\Inertia;
use Inertia\Response;

class ConfigurationController extends Controller
{
    public function __construct(
        public ConfigurationService $configurationService,
        public SettingsService $settingsService,
        public SettingsRepository $settingsRepository
    )
    {
    }

    public function index(): Response
    {
        return Inertia::render('configuration/index', [
            'companyDetails' => CompanyDetails::currentUser(null)->first(),
            'currencies' => config('currency')
        ]);
    }

    public function storeCompanyInformation(StoreCompanyInformationRequest $request): void
    {

        $this->settingsService->updateSettings($request->validated());

        Notify::success('Die Daten des Unternehmens wurden erfolgreich gespeichert.');
    }

    public function storeCurrencyAndTaxes(StoreCurrencyAndTaxesRequest $request): void
    {
        $this->settingsRepository->update($request->validated());

        Notify::success('Die Daten für Steuern und der Währung wurden erfolgreich gespeichert.');
    }

    public function storeBankInformation(StoreBankInformationRequest $request): void
    {
        $this->settingsRepository->update($request->validated());

        Notify::success('Die Bankinformationen wurden erfolgreich gespeichert.');
    }

    public function storePayments(StorePaymentInformationRequest $request): void
    {
        $this->settingsRepository->update($request->validated());

        Notify::success('Die Zahlungsinformationen wurden erfolgreich gespeichert.');
    }
}
