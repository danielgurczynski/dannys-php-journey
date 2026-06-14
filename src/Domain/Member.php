<?php

declare(strict_types=1);

namespace Danny\Journey\Domain;

class Member
{
    public function __construct(
        private int $id,
        private string $name,
        private string $email,
        private string $status = 'active',
        private string $role = 'member',
        private int $posts = 0,
        private int $reputation = 0,
        private string $joinedAt = '',
    ) {
        if ($this->joinedAt === '') {
            $this->joinedAt = date('Y-m-d H:i:s');
        }
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function setStatus(string $status): void
    {
        $this->status = $status;
    }

    public function getRole(): string
    {
        return $this->role;
    }

    public function getPosts(): int
    {
        return $this->posts;
    }

    public function getReputation(): int
    {
        return $this->reputation;
    }

    public function getJoinedAt(): string
    {
        return $this->joinedAt;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'status' => $this->status,
            'role' => $this->role,
            'posts' => $this->posts,
            'reputation' => $this->reputation,
            'joined_at' => $this->joinedAt,
        ];
    }

    public function toJson(): string
    {
        return json_encode($this->toArray(), JSON_PRETTY_PRINT);
    }

    public static function fromArray(array $data): self
    {
        return new self(
            id: $data['id'] ?? 0,
            name: $data['name'] ?? '',
            email: $data['email'] ?? '',
            status: $data['status'] ?? 'active',
            role: $data['role'] ?? 'member',
            posts: $data['posts'] ?? 0,
            reputation: $data['reputation'] ?? 0,
            joinedAt: $data['joined_at'] ?? '',
        );
    }
}
