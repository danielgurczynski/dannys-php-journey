# Daniel Gurczynski — PHP Platform Engineering Journey

An interactive, animated portfolio that walks through my PHP platform engineering skills — built by hand, specifically for the Invision Community platform engineering team.

## Why I Built This

Rather than sending a static resume, I wanted to demonstrate my skills through a working project. This site is a scrollable "developer journey map" with 8 chapters, each featuring a real interactive demo backed by clean PHP 8+ code. Every chapter maps directly to the skills needed for community platform engineering: OOP architecture, REST APIs, webhooks, OAuth, MySQL performance, and scalable design patterns.

The project isn't just a demo — it's a working PHP application with typed classes, PSR-4 autoloading, a simple router, and API endpoints. The code itself demonstrates the architecture patterns I'd bring to the team.

## How It Maps to the Job

| Chapter | Skill | Invision Community Relevance |
|---------|-------|------------------------------|
| Legacy PHP Cave | Understanding legacy codebases | 20+ year platform with incremental modernization |
| OOP Forge | Typed PHP, domain modeling | Member, content, and permission objects |
| API Bridge | REST API design & response formatting | Mobile apps, plugins, integrations |
| Webhook Watchtower | Event-driven architecture | Discord, Zapier, automation integrations |
| OAuth Gate | Authentication & authorization flows | SSO, API tokens, third-party apps |
| MySQL Performance Lab | Query optimization & indexing | Millions of rows across members, posts, content |
| Community Platform City | Member management & moderation | Core platform functionality |
| Final Boss | Scalable architecture patterns | Controllers, services, repos, events, queues |

## Architecture Decisions

### Clean Layered Architecture

The PHP backend follows a layered pattern:

```
HTTP Layer    → Router, ApiResponse
Domain Layer  → Member, WebhookEvent, EventStore
Service Layer → PerformanceDemoService
Data Layer    → MemberRepository
```

### Why Vanilla PHP (No Framework)?

For a portfolio project targeting a platform team, showing raw PHP skill is more valuable than framework knowledge. The code demonstrates:
- PSR-4 autoloading with Composer
- PHP 8.1+ features: constructor promotion, typed properties, readonly, enums
- Clean separation of concerns without framework magic
- A simple router that mirrors how lightweight frameworks work

### Frontend Choices

- **GSAP** for scroll-triggered animations (industry standard, lightweight)
- **Vanilla JS** for all interactivity (no React/Vue overhead for a single-page demo)
- **CSS custom properties** for consistent theming
- **JetBrains Mono** for code readability

## Database & Performance Thinking

The MySQL Performance Lab chapter demonstrates a real-world optimization pattern:

**The Problem:** A members query does a full table scan on 248,391 rows.

```sql
EXPLAIN SELECT m.*, COUNT(p.id) AS post_count
FROM members m
LEFT JOIN posts p ON p.author_id = m.id
WHERE m.status = 'active'
GROUP BY m.id;
-- type: ALL, rows: 248391, Extra: Using temporary; Using filesort
```

**The Fix:** Strategic indexes targeting the exact query pattern.

```sql
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_posts_author_created ON posts(author_id, created_at);
```

**Result:** 1,847ms → 42ms (97.7% improvement)

This mirrors exactly the kind of optimization needed at scale — community platforms have millions of members and posts, and a single missing index can degrade the entire user experience.

## How to Run Locally

### Prerequisites

- PHP 8.1 or higher
- Composer (optional, for autoloading)

### Quick Start

```bash
# Clone the repo
git clone <repo-url>
cd dannys-php-journey

# Install dependencies (generates autoloader)
composer install

# Start the built-in PHP server
php -S localhost:8000 -t public

# Open in browser
open http://localhost:8000
```

That's it. No database setup required — the demos use in-memory data and JSON files.

### API Endpoints

All endpoints are available at `http://localhost:8000/api/`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/members?q=` | Search members by name/email/status |
| POST | `/api/member/create` | Create a new member |
| POST | `/api/webhook` | Trigger a webhook event |
| GET | `/api/events` | List recent webhook events |
| POST | `/api/oauth/simulate` | Simulate OAuth 2.0 flow |
| POST | `/api/performance/slow-query` | Run unoptimized query |
| POST | `/api/performance/optimized-query` | Run optimized query with indexes |

## Project Structure

```
dannys-php-journey/
├── composer.json
├── README.md
├── data/
│   └── events.json          # Webhook event store
├── public/
│   ├── index.php             # Router + API endpoints
│   ├── index.html            # Single-page application
│   └── assets/
│       ├── css/styles.css    # Dark futuristic theme
│       └── js/app.js         # Interactive demos + GSAP
└── src/
    ├── Domain/
    │   ├── Member.php         # Typed domain object
    │   ├── WebhookEvent.php   # Event with status lifecycle
    │   └── EventStore.php     # JSON-file event persistence
    ├── Http/
    │   └── ApiResponse.php    # Standardized JSON responses
    ├── Repositories/
    │   └── MemberRepository.php  # In-memory member data + search
    └── Services/
        └── PerformanceDemoService.php  # Query optimization demos
```

## Features

- **Light / Dark mode** — Toggle with the sun/moon button in the nav bar. Respects `prefers-color-scheme` and persists via `localStorage`.
- **Hand-crafted design** — No templates, no component libraries. Every CSS class, animation, and layout was written from scratch.
- **Responsive** — Works on desktop, tablet, and mobile.

## Future Improvements

- **Real MySQL integration** — Replace in-memory data with actual database queries and show real EXPLAIN output
- **PHPUnit tests** — Unit tests for domain objects and services
- **Rate limiting** — Demonstrate API rate limiting patterns
- **Caching layer** — Redis integration for member lookups
- **Queue system** — Async job processing for webhook delivery
- **Admin dashboard** — Moderation interface for flagged members
- **API documentation** — OpenAPI/Swagger spec generation

## Screenshots

> _Screenshots coming soon. Run locally to see the full interactive experience._

---

Built with PHP 8+, vanilla JS, GSAP, and clean OOP architecture.
Every line written by hand by Daniel Gurczynski.
