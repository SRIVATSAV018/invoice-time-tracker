<?php

namespace App\Helpers;

class Notify
{
    const SUCCESS = 'success';
    const WARNING = 'warning';
    const INFO = 'info';
    const ERROR = 'error';

    public static function success(string $message): void
    {
        self::message($message, self::SUCCESS);
    }

    public static function warning(string $message): void
    {
        self::message($message, self::WARNING);
    }

    public static function info(string $message): void
    {
        self::message($message, self::INFO);
    }

    public static function error(string $message): void
    {
        self::message($message, self::ERROR);
    }

    protected static function message(string $message, string $type): void
    {
        session()->flash('notification', [
            'message' => $message,
            'type' => $type
        ]);
    }
}
