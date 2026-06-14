<?php

declare(strict_types=1);

namespace Danny\Journey\Http;

class ApiResponse
{
    public static function json(mixed $data, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
        echo json_encode($data, JSON_PRETTY_PRINT);
    }

    public static function success(mixed $data, string $message = 'OK'): void
    {
        self::json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ]);
    }

    public static function error(string $message, int $status = 400): void
    {
        self::json([
            'success' => false,
            'message' => $message,
            'data' => null,
        ], $status);
    }
}
