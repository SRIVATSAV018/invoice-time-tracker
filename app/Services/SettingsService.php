<?php

namespace App\Services;

use App\Models\CompanyDetails;
use App\Repositories\SettingsRepository;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SettingsService
{
    public function __construct(
        public SettingsRepository $settingsRepository
    )
    {
    }

    public function updateSettings(array $data): void
    {
        $updateData = [];

        if (isset($data['logo']) && $data['logo'] instanceof UploadedFile) {
            $updateData['logo'] = $this->replaceLogo($data['logo']);
        } else {
            unset($data['logo']);
        }

        $this->settingsRepository->update([
            ...$data,
            ...$updateData
        ]);
    }

    /**
     * @param UploadedFile $file
     * @return string Returns the new file path of the logo.
     */
    public function replaceLogo(UploadedFile $file): string
    {
        $userId = Auth::user()->id;

        $currentLogoPath = Auth::user()->getSettings('logo');

        $storage = Storage::disk('public');

        if (isset($currentLogoPath) && $storage->exists($currentLogoPath)) {
            $storage->delete($currentLogoPath);
        }

        $path = "users/{$userId}/logos";
        $mimeType = File::mimeType($file);
        $actualMimeType = explode('/', $mimeType);
        $fileName = Str::uuid() . '_' . time() . '.' . $actualMimeType[1];

        $storage->putFileAs(
            $path,
            $file,
            $fileName
        );

        return $path . '/' . $fileName;
    }
}
