<?php

declare(strict_types=1);

namespace Danny\Journey\Domain;

class EventStore
{
    private string $filePath;

    public function __construct(?string $filePath = null)
    {
        $this->filePath = $filePath ?? __DIR__ . '/../../data/events.json';
    }

    public function append(WebhookEvent $event): void
    {
        $events = $this->loadAll();
        $events[] = $event->toArray();
        file_put_contents($this->filePath, json_encode($events, JSON_PRETTY_PRINT));
    }

    public function loadAll(): array
    {
        if (!file_exists($this->filePath)) {
            return [];
        }

        $content = file_get_contents($this->filePath);
        if ($content === false || $content === '') {
            return [];
        }

        $decoded = json_decode($content, true);
        return is_array($decoded) ? $decoded : [];
    }

    public function getRecent(int $limit = 20): array
    {
        $events = $this->loadAll();
        return array_slice($events, -$limit);
    }

    public function clear(): void
    {
        file_put_contents($this->filePath, '[]');
    }

    public function count(): int
    {
        return count($this->loadAll());
    }
}
