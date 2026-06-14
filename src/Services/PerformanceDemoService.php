<?php

declare(strict_types=1);

namespace Danny\Journey\Services;

class PerformanceDemoService
{
    private const SLOW_QUERY_TIME_MS = 1847;
    private const OPTIMIZED_QUERY_TIME_MS = 42;

    public function runSlowQuery(): array
    {
        return [
            'query' => "SELECT m.*, COUNT(p.id) AS post_count, MAX(p.created_at) AS last_post\nFROM members m\nLEFT JOIN posts p ON p.author_id = m.id\nWHERE m.status = 'active'\nGROUP BY m.id\nORDER BY post_count DESC\nLIMIT 100;",
            'execution_time_ms' => self::SLOW_QUERY_TIME_MS,
            'explain' => [
                [
                    'id' => 1,
                    'select_type' => 'SIMPLE',
                    'table' => 'm',
                    'type' => 'ALL',
                    'possible_keys' => null,
                    'key' => null,
                    'rows' => 248391,
                    'Extra' => 'Using where; Using temporary; Using filesort',
                ],
                [
                    'id' => 1,
                    'select_type' => 'SIMPLE',
                    'table' => 'p',
                    'type' => 'ref',
                    'possible_keys' => 'author_id',
                    'key' => 'author_id',
                    'rows' => 12,
                    'Extra' => 'Using index',
                ],
            ],
            'analysis' => 'Full table scan on 248K rows. No index on status column. Temporary table and filesort required.',
            'rows_scanned' => 248391,
            'rows_returned' => 100,
        ];
    }

    public function runOptimizedQuery(): array
    {
        return [
            'query' => "SELECT m.*, COUNT(p.id) AS post_count, MAX(p.created_at) AS last_post\nFROM members m\nLEFT JOIN posts p ON p.author_id = m.id\nWHERE m.status = 'active'\nGROUP BY m.id\nORDER BY post_count DESC\nLIMIT 100;",
            'indexes_applied' => [
                'CREATE INDEX idx_members_status ON members(status)',
                'CREATE INDEX idx_posts_author_created ON posts(author_id, created_at)',
            ],
            'execution_time_ms' => self::OPTIMIZED_QUERY_TIME_MS,
            'explain' => [
                [
                    'id' => 1,
                    'select_type' => 'SIMPLE',
                    'table' => 'm',
                    'type' => 'ref',
                    'possible_keys' => 'idx_members_status',
                    'key' => 'idx_members_status',
                    'rows' => 18742,
                    'Extra' => 'Using where; Using index',
                ],
                [
                    'id' => 1,
                    'select_type' => 'SIMPLE',
                    'table' => 'p',
                    'type' => 'ref',
                    'possible_keys' => 'idx_posts_author_created',
                    'key' => 'idx_posts_author_created',
                    'rows' => 3,
                    'Extra' => 'Using index',
                ],
            ],
            'analysis' => 'Index seek on status. Covering index on posts(author_id, created_at) eliminates table lookups.',
            'improvement' => round((1 - self::OPTIMIZED_QUERY_TIME_MS / self::SLOW_QUERY_TIME_MS) * 100, 1) . '% faster',
            'rows_scanned' => 18742,
            'rows_returned' => 100,
        ];
    }

    public function getSlowTimeMs(): int
    {
        return self::SLOW_QUERY_TIME_MS;
    }

    public function getOptimizedTimeMs(): int
    {
        return self::OPTIMIZED_QUERY_TIME_MS;
    }
}
