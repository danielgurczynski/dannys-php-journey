/* ==========================================================================
   Daniel Gurczynski — PHP Platform Engineering Journey
   Interactive demos, GSAP scroll animations, theme toggle
   ========================================================================== */

(function () {
    'use strict';

    var API_BASE = '';
    var unlockedBadges = new Set();

    // =========================================================================
    // Theme Toggle
    // =========================================================================

    function initTheme() {
        var stored = localStorage.getItem('dg-theme');
        var preferred = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
        var theme = stored || preferred;
        document.documentElement.setAttribute('data-theme', theme);

        var btn = document.getElementById('themeToggle');
        if (!btn) return;

        btn.addEventListener('click', function () {
            var current = document.documentElement.getAttribute('data-theme');
            var next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('dg-theme', next);
        });
    }

    // =========================================================================
    // GSAP Animations
    // =========================================================================

    function initAnimations() {
        gsap.registerPlugin(ScrollTrigger);

        // Hero entrance
        var heroTl = gsap.timeline({ delay: 0.2 });
        heroTl
            .to('.hero-badge', { opacity: 1, y: 0, duration: 0.5 })
            .to('.hero-byline', { opacity: 1, y: 0, duration: 0.5 }, '-=0.3')
            .to('.hero-line', { opacity: 1, y: 0, duration: 0.6, stagger: 0.12 }, '-=0.3')
            .to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.5 }, '-=0.3')
            .to('.hero-stats', { opacity: 1, y: 0, duration: 0.5 }, '-=0.3')
            .to('.hero-cta', { opacity: 1, y: 0, duration: 0.5 }, '-=0.3')
            .to('.hero-scroll-indicator', { opacity: 0.6, duration: 0.4 }, '-=0.2');

        // Chapter animations
        document.querySelectorAll('.chapter').forEach(function (chapter) {
            gsap.to(chapter, {
                opacity: 1,
                y: 0,
                duration: 0.7,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: chapter,
                    start: 'top 82%',
                    toggleActions: 'play none none none',
                },
            });

            var children = chapter.querySelectorAll(
                '.story-card, .code-block, .demo-box, .arch-card, .arch-layer'
            );
            gsap.from(children, {
                opacity: 0,
                y: 24,
                duration: 0.5,
                stagger: 0.08,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: chapter,
                    start: 'top 65%',
                },
            });
        });

        // Global scroll progress
        ScrollTrigger.create({
            trigger: 'body',
            start: 'top top',
            end: 'bottom bottom',
            onUpdate: function (self) {
                var bar = document.getElementById('globalProgress');
                if (bar) {
                    bar.style.width = (self.progress * 100).toFixed(1) + '%';
                }
            },
        });

        // Unlock badges on scroll
        document.querySelectorAll('.chapter').forEach(function (chapter) {
            var chapterNum = chapter.dataset.chapter;
            ScrollTrigger.create({
                trigger: chapter,
                start: 'top 50%',
                onEnter: function () {
                    unlockBadge(chapterNum);
                },
            });
        });
    }

    // =========================================================================
    // Badge System
    // =========================================================================

    var badgeMap = {
        '1': 'badge-legacy', '2': 'badge-oop', '3': 'badge-api', '4': 'badge-webhook',
        '5': 'badge-oauth', '6': 'badge-mysql', '7': 'badge-community', '8': 'badge-scaling',
    };

    var badgeNames = {
        '1': 'Legacy Navigator', '2': 'OOP Architect', '3': 'API Architect',
        '4': 'Event Architect', '5': 'Auth Guardian', '6': 'Query Optimizer',
        '7': 'Platform Builder', '8': 'Scale Master',
    };

    function unlockBadge(chapterNum) {
        if (unlockedBadges.has(chapterNum)) return;
        unlockedBadges.add(chapterNum);

        var badge = document.getElementById(badgeMap[chapterNum]);
        if (badge) {
            badge.classList.remove('locked');
            badge.classList.add('unlocked');
            var icon = badge.querySelector('.badge-icon');
            if (icon) icon.textContent = '🏆';
        }

        var navSkills = document.getElementById('navSkills');
        var dots = navSkills.querySelectorAll('.nav-skill-dot');
        dots.forEach(function (dot, i) {
            if (unlockedBadges.has(String(i + 1))) {
                dot.classList.add('unlocked');
            }
        });

        if (unlockedBadges.size === 8) {
            var footer = document.getElementById('footerCompletion');
            if (footer) footer.style.display = 'block';
        }
    }

    function initNavDots() {
        var navSkills = document.getElementById('navSkills');
        for (var i = 1; i <= 8; i++) {
            var dot = document.createElement('div');
            dot.className = 'nav-skill-dot';
            dot.title = badgeNames[String(i)];
            navSkills.appendChild(dot);
        }
    }

    // =========================================================================
    // Chapter 2: Create Member
    // =========================================================================

    function initCreateMember() {
        var btn = document.getElementById('btnCreateMember');
        var output = document.getElementById('memberOutput');
        var jsonEl = document.getElementById('memberJson');
        if (!btn) return;

        btn.addEventListener('click', function () {
            btn.disabled = true;
            btn.textContent = 'Creating...';

            fetch(API_BASE + '/api/member/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'New Member #' + Math.floor(Math.random() * 1000),
                    email: 'member' + Math.floor(Math.random() * 1000) + '@example.com',
                }),
            })
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    output.style.display = 'block';
                    jsonEl.textContent = JSON.stringify(data, null, 2);
                    btn.disabled = false;
                    btn.textContent = 'Create Another Member';
                    unlockBadge('2');
                })
                .catch(function () {
                    btn.disabled = false;
                    btn.textContent = 'Create Member';
                });
        });
    }

    // =========================================================================
    // Chapter 3: API Request
    // =========================================================================

    function initApiRequest() {
        var btn = document.getElementById('btnApiRequest');
        var output = document.getElementById('apiOutput');
        var jsonEl = document.getElementById('apiJson');
        if (!btn) return;

        btn.addEventListener('click', function () {
            btn.disabled = true;
            btn.textContent = 'Sending...';

            fetch(API_BASE + '/api/members?q=alex')
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    output.style.display = 'block';
                    jsonEl.textContent = JSON.stringify(data, null, 2);
                    btn.disabled = false;
                    btn.textContent = 'Send Again';
                    unlockBadge('3');
                })
                .catch(function () {
                    btn.disabled = false;
                    btn.textContent = 'Send REST Request';
                });
        });
    }

    // =========================================================================
    // Chapter 4: Webhook Trigger
    // =========================================================================

    function initWebhook() {
        var btn = document.getElementById('btnTriggerWebhook');
        var select = document.getElementById('webhookType');
        var logBody = document.getElementById('eventLogBody');
        var countEl = document.getElementById('eventCount');
        if (!btn) return;

        var eventCount = 0;

        btn.addEventListener('click', function () {
            btn.disabled = true;
            btn.textContent = 'Triggering...';

            var type = select.value;
            var payloads = {
                'member.created': { member_id: 42, name: 'New User' },
                'member.banned': { member_id: 17, reason: 'Spam' },
                'content.reported': { content_id: 108, reporter_id: 5 },
                'purchase.completed': { order_id: 'ORD-9921', amount: 29.99 },
            };

            fetch(API_BASE + '/api/webhook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: type, payload: payloads[type] || {} }),
            })
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    if (data.success) {
                        eventCount++;
                        countEl.textContent = eventCount + ' event' + (eventCount !== 1 ? 's' : '');

                        var empty = logBody.querySelector('.event-empty');
                        if (empty) empty.remove();

                        var evt = data.data;
                        var item = document.createElement('div');
                        item.className = 'event-item';
                        item.innerHTML =
                            '<div class="event-status-dot ' + evt.status + '"></div>' +
                            '<div class="event-info">' +
                            '<div class="event-type">' + evt.type + '</div>' +
                            '<div class="event-id">ID: ' + evt.id + '</div>' +
                            '<div class="event-time">' + evt.created_at + '</div>' +
                            '</div>';

                        logBody.insertBefore(item, logBody.firstChild);

                        while (logBody.children.length > 10) {
                            logBody.removeChild(logBody.lastChild);
                        }
                    }

                    btn.disabled = false;
                    btn.textContent = 'Trigger Webhook';
                    unlockBadge('4');
                })
                .catch(function () {
                    btn.disabled = false;
                    btn.textContent = 'Trigger Webhook';
                });
        });
    }

    // =========================================================================
    // Chapter 5: OAuth Simulation
    // =========================================================================

    function initOAuth() {
        var btn = document.getElementById('btnOAuth');
        var flowContainer = document.getElementById('oauthFlow');
        if (!btn) return;

        btn.addEventListener('click', function () {
            btn.disabled = true;
            btn.textContent = 'Simulating...';
            flowContainer.style.display = 'flex';
            flowContainer.innerHTML = '';

            fetch(API_BASE + '/api/oauth/simulate', { method: 'POST' })
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    if (!data.success) return;

                    var steps = data.data;
                    var i = 0;

                    function showStep() {
                        if (i >= steps.length) {
                            btn.disabled = false;
                            btn.textContent = 'Simulate Again';
                            unlockBadge('5');
                            return;
                        }

                        var step = steps[i];
                        var el = document.createElement('div');
                        el.className = 'oauth-step';

                        var codeContent = '';
                        if (step.request) {
                            codeContent += '// Request\n' + JSON.stringify(step.request, null, 2);
                        }
                        if (step.response) {
                            if (codeContent) codeContent += '\n\n';
                            codeContent += '// Response\n' + JSON.stringify(step.response, null, 2);
                        }

                        el.innerHTML =
                            '<div class="step-number">' + step.step + '</div>' +
                            '<div class="step-content">' +
                            '<div class="step-name">' + step.name + '</div>' +
                            '<div class="step-desc">' + step.description + '</div>' +
                            (codeContent ? '<div class="step-code">' + escapeHtml(codeContent) + '</div>' : '') +
                            '</div>';

                        flowContainer.appendChild(el);

                        requestAnimationFrame(function () {
                            el.classList.add('active');
                        });

                        i++;
                        setTimeout(showStep, 800);
                    }

                    showStep();
                })
                .catch(function () {
                    btn.disabled = false;
                    btn.textContent = 'Simulate Login Flow';
                });
        });
    }

    // =========================================================================
    // Chapter 6: Performance Demo
    // =========================================================================

    function initPerformance() {
        var btnSlow = document.getElementById('btnSlowQuery');
        var btnIndex = document.getElementById('btnAddIndex');
        var results = document.getElementById('perfResults');
        if (!btnSlow) return;

        btnSlow.addEventListener('click', function () {
            btnSlow.disabled = true;
            btnSlow.textContent = 'Running...';

            fetch(API_BASE + '/api/performance/slow-query', { method: 'POST' })
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    if (!data.success) return;
                    var d = data.data;
                    results.style.display = 'flex';

                    var slowCard = document.createElement('div');
                    slowCard.className = 'perf-card slow';
                    slowCard.innerHTML =
                        '<div class="perf-header">' +
                        '<span class="perf-label">Without Index (Full Table Scan)</span>' +
                        '<span class="perf-time">' + d.execution_time_ms + 'ms</span>' +
                        '</div>' +
                        '<div class="perf-bar-wrap"><div class="perf-bar slow" style="width:0%"></div></div>' +
                        '<div class="perf-analysis">' + d.analysis + '</div>' +
                        '<div class="perf-sql">' + escapeHtml(d.query) + '</div>' +
                        '<div style="margin-top:10px;font-family:var(--font-mono);font-size:12px;color:var(--text-muted);">' +
                        'Rows scanned: ' + d.rows_scanned.toLocaleString() + ' → Returned: ' + d.rows_returned +
                        '</div>';

                    var oldSlow = results.querySelector('.perf-card.slow');
                    if (oldSlow) oldSlow.remove();
                    results.insertBefore(slowCard, results.firstChild);

                    requestAnimationFrame(function () {
                        var bar = slowCard.querySelector('.perf-bar');
                        if (bar) bar.style.width = '100%';
                    });

                    btnSlow.disabled = false;
                    btnSlow.textContent = 'Run Slow Query Again';
                    btnIndex.disabled = false;
                    unlockBadge('6');
                })
                .catch(function () {
                    btnSlow.disabled = false;
                    btnSlow.textContent = 'Run Slow Query';
                });
        });

        btnIndex.addEventListener('click', function () {
            btnIndex.disabled = true;
            btnIndex.textContent = 'Running...';

            fetch(API_BASE + '/api/performance/optimized-query', { method: 'POST' })
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    if (!data.success) return;
                    var d = data.data;

                    var fastCard = document.createElement('div');
                    fastCard.className = 'perf-card fast';
                    fastCard.innerHTML =
                        '<div class="perf-header">' +
                        '<span class="perf-label">With Indexes</span>' +
                        '<span class="perf-time">' + d.execution_time_ms + 'ms</span>' +
                        '</div>' +
                        '<div class="perf-bar-wrap"><div class="perf-bar fast" style="width:0%"></div></div>' +
                        '<div class="perf-analysis">' + d.analysis + '</div>' +
                        '<div class="perf-sql">' + escapeHtml(d.indexes_applied.join('\n')) + '</div>' +
                        '<div class="perf-improvement">' + d.improvement + '</div>' +
                        '<div style="margin-top:10px;font-family:var(--font-mono);font-size:12px;color:var(--text-muted);">' +
                        'Rows scanned: ' + d.rows_scanned.toLocaleString() + ' → Returned: ' + d.rows_returned +
                        '</div>';

                    var oldFast = results.querySelector('.perf-card.fast');
                    if (oldFast) oldFast.remove();
                    results.appendChild(fastCard);

                    requestAnimationFrame(function () {
                        var maxTime = 1847;
                        var pct = Math.round((d.execution_time_ms / maxTime) * 100);
                        var bar = fastCard.querySelector('.perf-bar');
                        if (bar) bar.style.width = pct + '%';
                    });

                    btnIndex.disabled = false;
                    btnIndex.textContent = 'Add Index & Re-run';
                })
                .catch(function () {
                    btnIndex.disabled = false;
                    btnIndex.textContent = 'Add Index & Re-run';
                });
        });
    }

    // =========================================================================
    // Chapter 7: Member Search
    // =========================================================================

    function initMemberSearch() {
        var searchInput = document.getElementById('memberSearch');
        var membersBody = document.getElementById('membersBody');
        var statsEl = document.getElementById('memberStats');
        var pills = document.querySelectorAll('.pill');
        if (!searchInput) return;

        var allMembers = [];
        var activeFilter = 'all';

        function loadMembers(query) {
            var url = API_BASE + '/api/members';
            if (query) url += '?q=' + encodeURIComponent(query);

            fetch(url)
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    if (!data.success) return;
                    allMembers = data.data;
                    renderMembers();
                    unlockBadge('7');
                });
        }

        function renderMembers() {
            var filtered = allMembers;
            if (activeFilter !== 'all') {
                filtered = allMembers.filter(function (m) {
                    return m.status === activeFilter;
                });
            }

            membersBody.innerHTML = '';

            if (filtered.length === 0) {
                membersBody.innerHTML =
                    '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-muted);">No members found</td></tr>';
                statsEl.textContent = '0 results';
                return;
            }

            filtered.forEach(function (m) {
                var tr = document.createElement('tr');
                tr.innerHTML =
                    '<td style="font-family:var(--font-mono);color:var(--text-muted);font-size:13px;">' + m.id + '</td>' +
                    '<td style="font-weight:600;">' + escapeHtml(m.name) + '</td>' +
                    '<td style="font-family:var(--font-mono);font-size:13px;">' + escapeHtml(m.email) + '</td>' +
                    '<td>' + m.role + '</td>' +
                    '<td style="font-family:var(--font-mono);">' + m.posts + '</td>' +
                    '<td style="font-family:var(--font-mono);">' + m.reputation + '</td>' +
                    '<td><span class="status-badge ' + m.status + '">' + m.status + '</span></td>';
                membersBody.appendChild(tr);
            });

            var active = allMembers.filter(function (m) { return m.status === 'active'; }).length;
            var flagged = allMembers.filter(function (m) { return m.status === 'flagged'; }).length;
            var pending = allMembers.filter(function (m) { return m.status === 'pending'; }).length;

            statsEl.innerHTML =
                '<span class="member-stat">Showing: <strong>' + filtered.length + '</strong></span>' +
                '<span class="member-stat">Active: <strong>' + active + '</strong></span>' +
                '<span class="member-stat" style="color:var(--accent-red)">Flagged: <strong>' + flagged + '</strong></span>' +
                '<span class="member-stat" style="color:var(--accent-yellow)">Pending: <strong>' + pending + '</strong></span>';
        }

        var debounceTimer;
        searchInput.addEventListener('input', function () {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(function () {
                loadMembers(searchInput.value);
            }, 300);
        });

        pills.forEach(function (pill) {
            pill.addEventListener('click', function () {
                pills.forEach(function (p) { p.classList.remove('active'); });
                pill.classList.add('active');
                activeFilter = pill.dataset.filter;
                renderMembers();
            });
        });

        loadMembers('');
    }

    // =========================================================================
    // Utilities
    // =========================================================================

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // =========================================================================
    // Init
    // =========================================================================

    document.addEventListener('DOMContentLoaded', function () {
        initTheme();
        initNavDots();
        initAnimations();
        initCreateMember();
        initApiRequest();
        initWebhook();
        initOAuth();
        initPerformance();
        initMemberSearch();
    });
})();
