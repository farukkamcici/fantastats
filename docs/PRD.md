# 🏀 FANTASTATS - Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** January 5, 2026  
**Author:** Development Team

---

## 📋 Executive Summary

Fantastats, Yahoo Fantasy Basketball oyuncuları için geliştirilmiş bir yardımcı uygulamadır. Kullanıcıların haftalık/sezon istatistiklerini görüntülemesine, optimal lineup önerileri almasına ve streaming stratejileri planlamasına yardımcı olur.

---

## 🎯 Problem Statement

Yahoo Fantasy Basketball oyuncuları şu sorunlarla karşılaşıyor:

1. **Veri Dağınıklığı:** Stats, matchup'lar ve FA'ler farklı sayfalarda
2. **Manuel Analiz:** Haftalık maç sayısı, off-day analizi manuel yapılıyor
3. **Streaming Zorluğu:** Hangi FA'yi ne zaman alacağına karar vermek zor
4. **Export Yok:** Yahoo'dan veri export etmek zor

---

## 👤 Target Users

| Persona | Açıklama | Öncelik |
|---------|----------|---------|
| **Casual Player** | Haftada 1-2 kez bakar, basit dashboard ister | Primary |
| **Competitive Player** | Günlük optimize eder, streaming yapar | Primary |
| **League Manager** | Tüm lig verilerini görmek ister | Secondary |

---

## 🏗️ Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│                   Next.js 16 + React 19                     │
│              TypeScript + Tailwind CSS                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API LAYER                              │
│                 Next.js API Routes                          │
│              (App Router - /api/*)                          │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   NextAuth.js   │ │  Yahoo Fantasy  │ │  balldontlie    │
│  (Yahoo OAuth)  │ │   Sports API    │ │   NBA API       │
└─────────────────┘ └─────────────────┘ └─────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    CACHE LAYER                              │
│                   Upstash Redis                             │
│            (TTL-based caching strategy)                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

```
┌──────────┐    ┌──────────────┐    ┌─────────────┐
│  User    │───▶│  /api/auth   │───▶│   Yahoo     │
│  Click   │    │  /signin     │    │   OAuth     │
│  Login   │    │  (NextAuth)  │    │   Consent   │
└──────────┘    └──────────────┘    └─────────────┘
                                           │
                                           ▼
┌──────────┐    ┌──────────────┐    ┌─────────────┐
│  User    │◀───│  JWT Session │◀───│  Callback   │
│  Dashboard│   │  Created     │    │  /api/auth  │
└──────────┘    └──────────────┘    └─────────────┘
```

**Token Management:**
- Access Token: 1 hour (Yahoo limitation)
- Refresh Token: Stored in JWT, auto-refresh
- Session: HTTP-only cookie (secure)

---

## 📊 Data Model

### Yahoo API Resources

| Resource | Endpoint | Cache TTL |
|----------|----------|-----------|
| User Games | `/users;use_login=1/games` | 24h |
| User Leagues | `/users;use_login=1/games;game_keys=nba/leagues` | 1h |
| League Settings | `/league/{key}/settings` | 24h |
| League Standings | `/league/{key}/standings` | 1h |
| League Scoreboard | `/league/{key}/scoreboard` | 5m |
| Team Roster | `/team/{key}/roster` | 15m |
| Team Stats | `/team/{key}/stats` | 30m |
| Free Agents | `/league/{key}/players;status=A` | 10m |
| Transactions | `/league/{key}/transactions` | 30m |

### Key Formats

```
Game Key:    nba (current) or {game_id}
League Key:  {game_key}.l.{league_id}        → 418.l.12345
Team Key:    {league_key}.t.{team_id}        → 418.l.12345.t.1
Player Key:  {game_key}.p.{player_id}        → 418.p.5864
```

---

## 🚀 Feature Roadmap

### MVP (Phase 1) - 2 Weeks

| Feature | Priority | Complexity | Status |
|---------|----------|------------|--------|
| Yahoo OAuth Login | P0 | Medium | 🔲 Todo |
| League Selection | P0 | Low | 🔲 Todo |
| Dashboard - Weekly Stats | P0 | Medium | 🔲 Todo |
| Dashboard - Season Stats | P0 | Medium | 🔲 Todo |
| Matchup Display | P0 | Medium | 🔲 Todo |
| CSV Export | P1 | Low | 🔲 Todo |
| Responsive UI | P1 | Medium | 🔲 Todo |

### V1 (Phase 2) - 3 Weeks

| Feature | Priority | Complexity | Status |
|---------|----------|------------|--------|
| NBA Schedule Integration | P0 | Medium | 🔲 Todo |
| Games This Week Display | P0 | Medium | 🔲 Todo |
| Streaming Suggestions | P1 | High | 🔲 Todo |
| Optimal Lineup (Weekly) | P1 | High | 🔲 Todo |
| Schedule Grid View | P1 | Medium | 🔲 Todo |
| Off-Day Analysis | P2 | Medium | 🔲 Todo |

### V2 (Phase 3) - Future

| Feature | Priority | Status |
|---------|----------|--------|
| Email Notifications | P2 | 🔲 Backlog |
| Trade Analyzer | P2 | 🔲 Backlog |
| Historical Comparison | P3 | 🔲 Backlog |
| Multi-League Support | P2 | 🔲 Backlog |

---

## 📁 Project Structure

```
fantastats/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx              # Landing page
│   │   ├── layout.tsx            # Root layout
│   │   ├── dashboard/
│   │   │   ├── page.tsx          # Main dashboard
│   │   │   ├── weekly/
│   │   │   │   └── page.tsx      # Weekly stats
│   │   │   ├── season/
│   │   │   │   └── page.tsx      # Season stats
│   │   │   └── matchup/
│   │   │       └── page.tsx      # Current matchup
│   │   ├── leagues/
│   │   │   └── page.tsx          # League selection
│   │   ├── streaming/            # V1
│   │   │   └── page.tsx          # Streaming planner
│   │   └── api/
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       │       └── route.ts  # NextAuth handler
│   │       ├── yahoo/
│   │       │   ├── leagues/
│   │       │   │   └── route.ts
│   │       │   ├── team/
│   │       │   │   └── route.ts
│   │       │   ├── roster/
│   │       │   │   └── route.ts
│   │       │   ├── standings/
│   │       │   │   └── route.ts
│   │       │   └── scoreboard/
│   │       │       └── route.ts
│   │       ├── nba/              # V1
│   │       │   └── schedule/
│   │       │       └── route.ts
│   │       └── export/
│   │           └── csv/
│   │               └── route.ts
│   ├── components/
│   │   ├── ui/                   # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Table.tsx
│   │   │   └── Loading.tsx
│   │   ├── auth/
│   │   │   ├── LoginButton.tsx
│   │   │   └── UserMenu.tsx
│   │   ├── dashboard/
│   │   │   ├── StatsCard.tsx
│   │   │   ├── MatchupCard.tsx
│   │   │   ├── RosterTable.tsx
│   │   │   └── WeeklyChart.tsx
│   │   ├── leagues/
│   │   │   └── LeagueSelector.tsx
│   │   └── streaming/            # V1
│   │       ├── ScheduleGrid.tsx
│   │       └── StreamerList.tsx
│   ├── lib/
│   │   ├── redis.ts              # ✅ Done
│   │   ├── auth.ts               # NextAuth config
│   │   ├── yahoo/
│   │   │   ├── client.ts         # Yahoo API client
│   │   │   ├── types.ts          # TypeScript types
│   │   │   └── endpoints.ts      # API endpoints
│   │   ├── nba/                  # V1
│   │   │   ├── client.ts         # balldontlie client
│   │   │   └── types.ts
│   │   └── utils/
│   │       ├── format.ts         # Formatters
│   │       └── csv.ts            # CSV generator
│   ├── hooks/
│   │   ├── useYahooApi.ts        # Yahoo API hook
│   │   ├── useLeague.ts          # League context
│   │   └── useNbaSchedule.ts     # V1
│   ├── types/
│   │   ├── yahoo.ts              # Yahoo API types
│   │   └── nba.ts                # NBA types
│   └── styles/
│       └── globals.css
├── docs/
│   ├── PRD.md                    # This file
│   └── DEVELOPMENT_PLAN.md       # Sprint plan
├── public/
│   └── images/
├── .env.local                    # ✅ Configured
├── .env.example                  # ✅ Done
└── package.json
```

---

## 🔒 Security Requirements

| Requirement | Implementation |
|-------------|----------------|
| OAuth tokens encrypted | NextAuth JWT encryption |
| No tokens in localStorage | HTTP-only cookies |
| API rate limiting | Upstash Redis + custom throttle |
| HTTPS only | Vercel default |
| Environment secrets | .env.local (gitignored) |

---

## 📈 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Page Load Time | < 2s | Vercel Analytics |
| API Response Time | < 500ms | Custom logging |
| Cache Hit Rate | > 80% | Redis metrics |
| User Retention | > 40% weekly | Analytics |

---

## ⚠️ Known Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| Yahoo rate limit (undefined) | API throttling | Cache aggressively |
| Access token 1hr expiry | Re-auth needed | Auto-refresh |
| No real-time updates | Stale data possible | Short cache TTL |
| Yahoo API read-only (MVP) | Can't make moves | Manual in Yahoo app |

---

## 📝 Acceptance Criteria

### MVP Launch Criteria
- [ ] User can login with Yahoo account
- [ ] User can select their NBA league
- [ ] Dashboard shows weekly and season stats
- [ ] Current matchup is visible
- [ ] User can export data to CSV
- [ ] Works on mobile (responsive)
- [ ] No critical bugs

### V1 Launch Criteria
- [ ] NBA schedule integrated
- [ ] Games this week displayed per player
- [ ] Streaming suggestions available
- [ ] Schedule grid functional
- [ ] Performance < 2s page load

---

## 📎 References

- [Yahoo Fantasy Sports API Documentation](https://developer.yahoo.com/fantasysports/guide/)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [balldontlie API](https://www.balldontlie.io/)
- [Upstash Redis](https://upstash.com/docs/redis/overall/getstarted)
