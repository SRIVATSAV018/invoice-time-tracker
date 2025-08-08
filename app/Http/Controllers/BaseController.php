<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Gate;

class BaseController extends Controller
{
    /**
     * Checks if the current authhenticated user has the given ability to perform this action.
     * @param string $ability
     * @param $arguments
     * @return void
     */
    public function authorize(string $ability, $arguments)
    {
        Gate::authorize($ability, $arguments);
    }
}
