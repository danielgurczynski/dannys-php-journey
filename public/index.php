<?php

declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

use Danny\Journey\Domain\Member;
use Danny\Journey\Domain\WebhookEvent;
use Danny\Journey\Domain\EventStore;
use Danny\Journey\Http\ApiResponse;
use Danny\Journey\Repositories\MemberRepository;
use Danny\Journey\Services\PerformanceDemoService;

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$memberRepo = new MemberRepository();
$eventStore = new EventStore();
$perfService = new PerformanceDemoService();

// Route: serve the SPA
if ($uri === '/' || $uri === '/index.html') {
    readfile(__DIR__ . '/index.html');
    exit;
}

// API routes
if (str_starts_with($uri, '/api/')) {
    switch (true) {
        case $uri === '/api/members' && $method === 'GET':
            $query = $_GET['q'] ?? '';
            $members = $query !== '' ? $memberRepo->search($query) : $memberRepo->all();
            ApiResponse::success(array_map(fn(Member $m) => $m->toArray(), $members));
            break;

        case $uri === '/api/member/create' && $method === 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            $name = trim($input['name'] ?? '');
            $email = trim($input['email'] ?? '');

            if ($name === '' || $email === '') {
                ApiResponse::error('Name and email are required');
                break;
            }

            $member = $memberRepo->create($name, $email);
            ApiResponse::success($member->toArray(), 'Member created successfully');
            break;

        case $uri === '/api/webhook' && $method === 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            $type = $input['type'] ?? 'member.created';
            $payload = $input['payload'] ?? ['message' => 'Default event'];

            $event = WebhookEvent::create($type, $payload);
            $event->markProcessed();
            $eventStore->append($event);

            ApiResponse::success($event->toArray(), 'Webhook event processed');
            break;

        case $uri === '/api/events' && $method === 'GET':
            $events = $eventStore->getRecent(20);
            ApiResponse::success($events);
            break;

        case $uri === '/api/oauth/simulate' && $method === 'POST':
            $steps = [
                [
                    'step' => 1,
                    'name' => 'Authorization Request',
                    'description' => 'User is redirected to the authorization server',
                    'request' => [
                        'GET /oauth/authorize' => [
                            'response_type' => 'code',
                            'client_id' => 'com_community_platform_abc123',
                            'redirect_uri' => 'https://community.example.com/callback',
                            'scope' => 'member.read member.write',
                            'state' => bin2hex(random_bytes(8)),
                        ],
                    ],
                ],
                [
                    'step' => 2,
                    'name' => 'Authorization Code',
                    'description' => 'User grants permission, receives authorization code',
                    'response' => [
                        'code' => 'auth_' . bin2hex(random_bytes(8)),
                        'state' => bin2hex(random_bytes(8)),
                    ],
                ],
                [
                    'step' => 3,
                    'name' => 'Token Exchange',
                    'description' => 'Backend exchanges code for access token',
                    'request' => [
                        'POST /oauth/token' => [
                            'grant_type' => 'authorization_code',
                            'code' => 'auth_' . bin2hex(random_bytes(8)),
                            'client_id' => 'com_community_platform_abc123',
                            'client_secret' => '••••••••••••',
                            'redirect_uri' => 'https://community.example.com/callback',
                        ],
                    ],
                ],
                [
                    'step' => 4,
                    'name' => 'Access Token',
                    'description' => 'Authorization server returns tokens',
                    'response' => [
                        'access_token' => 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.' . bin2hex(random_bytes(16)),
                        'token_type' => 'Bearer',
                        'expires_in' => 3600,
                        'refresh_token' => 'rt_' . bin2hex(random_bytes(16)),
                        'scope' => 'member.read member.write',
                    ],
                ],
                [
                    'step' => 5,
                    'name' => 'Profile Response',
                    'description' => 'Access token used to fetch member profile',
                    'request' => [
                        'GET /api/me' => [
                            'headers' => ['Authorization' => 'Bearer eyJhbGciOi...'],
                        ],
                    ],
                    'response' => [
                        'id' => 42,
                        'name' => 'Alex Chen',
                        'email' => 'alex.chen@example.com',
                        'role' => 'admin',
                        'reputation' => 1250,
                    ],
                ],
            ];
            ApiResponse::success($steps, 'OAuth flow simulated');
            break;

        case $uri === '/api/performance/slow-query' && $method === 'POST':
            ApiResponse::success($perfService->runSlowQuery());
            break;

        case $uri === '/api/performance/optimized-query' && $method === 'POST':
            ApiResponse::success($perfService->runOptimizedQuery());
            break;

        default:
            ApiResponse::error('Not found', 404);
            break;
    }
    exit;
}

// Static assets
if (str_starts_with($uri, '/assets/')) {
    $file = __DIR__ . $uri;
    if (file_exists($file)) {
        $ext = pathinfo($file, PATHINFO_EXTENSION);
        $mimeTypes = [
            'css' => 'text/css',
            'js' => 'application/javascript',
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'svg' => 'image/svg+xml',
            'ico' => 'image/x-icon',
        ];
        header('Content-Type: ' . ($mimeTypes[$ext] ?? 'application/octet-stream'));
        readfile($file);
        exit;
    }
}

ApiResponse::error('Not found', 404);
