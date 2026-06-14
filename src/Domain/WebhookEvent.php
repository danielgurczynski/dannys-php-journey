<?php

declare(strict_types=1);

namespace Danny\Journey\Domain;

class WebhookEvent
{
    public function __construct(
        private string $id,
        private string $type,
        private array $payload,
        private string $status = 'pending',
        private string $createdAt = '',
        private ?string $processedAt = null,
    ) {
        if ($this->createdAt === '') {
            $this->createdAt = date('Y-m-d H:i:s');
        }
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function getPayload(): array
    {
        return $this->payload;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function markProcessed(): void
    {
        $this->status = 'processed';
        $this->processedAt = date('Y-m-d H:i:s');
    }

    public function markFailed(): void
    {
        $this->status = 'failed';
        $this->processedAt = date('Y-m-d H:i:s');
    }

    public function getCreatedAt(): string
    {
        return $this->createdAt;
    }

    public function getProcessedAt(): ?string
    {
        return $this->processedAt;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'payload' => $this->payload,
            'status' => $this->status,
            'created_at' => $this->createdAt,
            'processed_at' => $this->processedAt,
        ];
    }

    public static function create(string $type, array $payload): self
    {
        return new self(
            id: bin2hex(random_bytes(8)),
            type: $type,
            payload: $payload,
        );
    }
}
