<?php

declare(strict_types=1);

namespace Danny\Journey\Repositories;

use Danny\Journey\Domain\Member;

class MemberRepository
{
    private array $members = [];

    public function __construct()
    {
        $this->seed();
    }

    private function seed(): void
    {
        $names = [
            ['Alex Chen', 'active', 'admin', 342, 1250],
            ['Sarah Miller', 'active', 'moderator', 89, 670],
            ['James Wilson', 'flagged', 'member', 12, 45],
            ['Maria Garcia', 'active', 'member', 156, 890],
            ['David Kim', 'pending', 'member', 0, 0],
            ['Emily Taylor', 'active', 'moderator', 203, 1100],
            ['Ryan Johnson', 'active', 'member', 67, 340],
            ['Lisa Anderson', 'flagged', 'member', 3, 10],
            ['Chris Brown', 'active', 'member', 234, 1560],
            ['Amanda White', 'pending', 'member', 0, 0],
            ['Mike Thompson', 'active', 'member', 45, 280],
            ['Jessica Lee', 'active', 'member', 178, 920],
            ['Tom Martinez', 'flagged', 'member', 8, 25],
            ['Rachel Davis', 'active', 'admin', 567, 2100],
            ['Kevin Robinson', 'active', 'member', 91, 445],
        ];

        foreach ($names as $i => [$name, $status, $role, $posts, $rep]) {
            $email = strtolower(str_replace(' ', '.', $name)) . '@example.com';
            $this->members[] = new Member(
                id: $i + 1,
                name: $name,
                email: $email,
                status: $status,
                role: $role,
                posts: $posts,
                reputation: $rep,
                joinedAt: date('Y-m-d H:i:s', strtotime("-" . rand(1, 365) . " days")),
            );
        }
    }

    public function findById(int $id): ?Member
    {
        foreach ($this->members as $member) {
            if ($member->getId() === $id) {
                return $member;
            }
        }
        return null;
    }

    public function search(string $query): array
    {
        $query = strtolower(trim($query));
        if ($query === '') {
            return $this->members;
        }

        return array_values(array_filter($this->members, function (Member $m) use ($query) {
            return str_contains(strtolower($m->getName()), $query)
                || str_contains(strtolower($m->getEmail()), $query)
                || str_contains(strtolower($m->getStatus()), $query)
                || str_contains(strtolower($m->getRole()), $query);
        }));
    }

    public function findByStatus(string $status): array
    {
        return array_values(array_filter($this->members, function (Member $m) use ($status) {
            return $m->getStatus() === $status;
        }));
    }

    public function create(string $name, string $email): Member
    {
        $id = count($this->members) + 1;
        $member = new Member(
            id: $id,
            name: $name,
            email: $email,
            status: 'active',
            role: 'member',
        );
        $this->members[] = $member;
        return $member;
    }

    public function all(): array
    {
        return $this->members;
    }

    public function count(): int
    {
        return count($this->members);
    }
}
