# PostHog post-wizard report

The wizard has completed a PostHog integration for **DevEvent** — a developer events hub built with Next.js 16.2.9 (App Router). PostHog is initialized via `instrumentation-client.ts` (the recommended approach for Next.js 15.3+), with a reverse proxy configured in `next.config.ts` to route analytics traffic through `/ingest`. Two client-side events are now captured across the core user interaction points: clicking the "Explore Events" CTA and clicking a featured event card.

| Event Name | Description | File |
|---|---|---|
| `explore_events_clicked` | User clicks the 'Explore Events' call-to-action button on the home page. | `components/ExploreBtn.tsx` |
| `event_card_clicked` | User clicks on a featured event card to view event details. | `components/EventCard.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://eu.posthog.com/project/210507/dashboard/776646)
- [Explore Events Clicks](https://eu.posthog.com/project/210507/insights/O5Ly99K7) — Daily total clicks on the Explore Events button
- [Event Card Clicks](https://eu.posthog.com/project/210507/insights/he8TVpoF) — Daily total clicks on event cards
- [Unique Users — Explore vs Event Click](https://eu.posthog.com/project/210507/insights/v319vyUd) — Unique daily active users for each interaction
- [Total Explore Clicks](https://eu.posthog.com/project/210507/insights/Ph6kvtXu) — Single-number total Explore Events button clicks (last 30 days)
- [Most Clicked Events](https://eu.posthog.com/project/210507/insights/In6QJX9s) — Event card clicks broken down by event title

## Verify before merging

- [ ] Run a full production build (`npm run build`) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` to `.env.example` (or any bootstrap scripts) so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or your bundler's upload step) into CI so production stack traces de-minify.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
