<?php

namespace App\Services;

use App\Models\CompanyDetails;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ConfigurationService
{
    public function replaceLogo(UploadedFile $uploadedFile): void
    {
        $userId = Auth::user()->id;

        $companyDetails = CompanyDetails::currentUser(null)->first();

        if (isset($companyDetails->logo_path) && Storage::disk('public')->exists($companyDetails->logo_path)) {
            Storage::disk('public')->delete($companyDetails->logo_path);
        }

        $path = "users/{$userId}/logos";
        $mimeType = File::mimeType($uploadedFile);
        $actualMimeType = explode('/', $mimeType);
        $fileName = Str::uuid() . '_' . time() . '.' . $actualMimeType[1];

        Storage::disk('public')->putFileAs(
            $path,
            $uploadedFile,
            $fileName
        );

        CompanyDetails::currentUser(null)
            ->first()
            ->update([
                'logo_path' => $path . '/' . $fileName
            ]);
    }
}
