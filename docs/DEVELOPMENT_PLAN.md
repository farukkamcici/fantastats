# 🏀 FANTASTATS - Development Plan

**Version:** 1.0  
**Created:** January 5, 2026  
**Total Duration:** 5-6 Weeks

---

## 📅 Sprint Overview

| Sprint | Duration | Focus | Status |
|--------|----------|-------|--------|
| Sprint 0 | Done | Project Setup | ✅ Complete |
| Sprint 1 | Week 1 | Auth + Yahoo API | 🔲 Current |
| Sprint 2 | Week 2 | Dashboard MVP | 🔲 Pending |
| Sprint 3 | Week 3 | Export + Polish | 🔲 Pending |
| Sprint 4 | Week 4 | NBA Schedule (V1) | 🔲 Pending |
| Sprint 5 | Week 5 | Streaming (V1) | 🔲 Pending |

---

## ✅ Sprint 0: Project Setup (COMPLETED)

### Completed Tasks

| Task | Status | Files |
|------|--------|-------|
| Create Next.js project | ✅ | `/fantastats` |
| GitHub repo setup | ✅ | `farukkamcici/fantastats` |
| Environment variables | ✅ | `.env.local`, `.env.example` |
| Upstash Redis setup | ✅ | `src/lib/redis.ts` |
| Redis test endpoint | ✅ | `src/app/api/test-redis/route.ts` |
| Yahoo Developer App | ✅ | Credentials in `.env.local` |

---

## 🔲 Sprint 1: Authentication + Yahoo API Client (Week 1)

### Goals
- User can login/logout with Yahoo
- Yahoo API wrapper ready
- Basic API endpoints working

### Tasks

#### Day 1-2: NextAuth Setup

| Task | Priority | Est. Hours |
|------|----------|------------|
| Install next-auth package | P0 | 0.5h |
| Create auth configuration | P0 | 2h |
| Implement Yahoo OAuth provider | P0 | 3h |
| Create login/logout pages | P0 | 2h |
| Test auth flow | P0 | 1h |

**Files to create:**
```
src/lib/auth.ts                    # NextAuth configuration
src/app/api/auth/[...nextauth]/route.ts  # Auth handler
src/components/auth/LoginButton.tsx
src/components/auth/UserMenu.tsx
src/app/login/page.tsx
```

#### Day 3-4: Yahoo API Client

| Task | Priority | Est. Hours |
|------|----------|------------|
| Create Yahoo API types | P0 | 2h |
| Implement Yahoo client class | P0 | 4h |
| Add caching layer | P0 | 2h |
| Create league fetcher | P0 | 2h |

**Files to create:**
```
src/lib/yahoo/types.ts             # TypeScript interfaces
src/lib/yahoo/client.ts            # Yahoo API wrapper
src/lib/yahoo/endpoints.ts         # Endpoint constants
```

#### Day 5: API Routes

| Task | Priority | Est. Hours |
|------|----------|------------|
| GET /api/yahoo/leagues | P0 | 1h |
| GET /api/yahoo/team/[key] | P0 | 1h |
| GET /api/yahoo/roster/[key] | P0 | 1h |
| Error handling | P0 | 1h |
| Testing | P0 | 2h |

**Files to create:**
```
src/app/api/yahoo/leagues/route.ts
src/app/api/yahoo/team/[teamKey]/route.ts
src/app/api/yahoo/roster/[teamKey]/route.ts
```

### Sprint 1 Deliverables
- [ ] Login with Yahoo working
- [ ] User session persists
- [ ] Can fetch user's leagues
- [ ] Can fetch team data
- [ ] API responses cached

---

## 🔲 Sprint 2: Dashboard MVP (Week 2)

### Goals
- Main dashboard page
- Weekly and season stats display
- Matchup view

### Tasks

#### Day 1-2: UI Components

| Task | Priority | Est. Hours |
|------|----------|------------|
| Create base UI components | P0 | 3h |
| StatsCard component | P0 | 2h |
| Table component | P0 | 2h |
| Loading states | P1 | 1h |

**Files to create:**
```
src/components/ui/Button.tsx
src/components/ui/Card.tsx
src/components/ui/Table.tsx
src/components/ui/Loading.tsx
src/components/ui/Badge.tsx
```

#### Day 3: League Selection

| Task | Priority | Est. Hours |
|------|----------|------------|
| League selector page | P0 | 3h |
| League context/state | P0 | 2h |
| Persist selection | P1 | 1h |

**Files to create:**
```
src/app/leagues/page.tsx
src/components/leagues/LeagueSelector.tsx
src/hooks/useLeague.ts
```

#### Day 4-5: Dashboard Pages

| Task | Priority | Est. Hours |
|------|----------|------------|
| Dashboard layout | P0 | 2h |
| Weekly stats view | P0 | 3h |
| Season stats view | P0 | 3h |
| Matchup card | P0 | 3h |
| Roster table | P0 | 3h |

**Files to create:**
```
src/app/dashboard/page.tsx
src/app/dashboard/layout.tsx
src/components/dashboard/StatsCard.tsx
src/components/dashboard/MatchupCard.tsx
src/components/dashboard/RosterTable.tsx
src/components/dashboard/WeeklyChart.tsx
```

### Sprint 2 Deliverables
- [ ] League selection works
- [ ] Dashboard shows weekly stats
- [ ] Dashboard shows season stats
- [ ] Current matchup displayed
- [ ] Roster table visible

---

## 🔲 Sprint 3: Export + Polish (Week 3)

### Goals
- CSV export functionality
- Error handling polish
- Mobile responsiveness
- MVP ready for release

### Tasks

#### Day 1-2: CSV Export

| Task | Priority | Est. Hours |
|------|----------|------------|
| CSV utility functions | P1 | 2h |
| Export API endpoint | P1 | 2h |
| Export UI buttons | P1 | 2h |
| Download handling | P1 | 1h |

**Files to create:**
```
src/lib/utils/csv.ts
src/app/api/export/csv/route.ts
src/components/export/ExportButton.tsx
```

**Export Types:**
- `weekly_stats.csv` - Team weekly performance
- `season_stats.csv` - Season totals
- `roster.csv` - Current roster
- `matchups.csv` - All matchup results

#### Day 3-4: Polish & Mobile

| Task | Priority | Est. Hours |
|------|----------|------------|
| Mobile responsive fixes | P1 | 4h |
| Error boundary | P1 | 2h |
| Loading skeletons | P2 | 2h |
| Empty states | P2 | 1h |
| 404 page | P2 | 0.5h |

#### Day 5: Testing & Bug Fixes

| Task | Priority | Est. Hours |
|------|----------|------------|
| End-to-end testing | P0 | 3h |
| Bug fixes | P0 | 3h |
| Performance check | P1 | 1h |
| Documentation | P2 | 1h |

### Sprint 3 Deliverables
- [ ] All CSV exports working
- [ ] Mobile friendly
- [ ] No critical bugs
- [ ] Error states handled
- [ ] **MVP READY FOR RELEASE** 🚀

---

## 🔲 Sprint 4: NBA Schedule Integration (Week 4 - V1)

### Goals
- balldontlie API integration
- Games this week per player
- Schedule display

### Tasks

#### Day 1-2: NBA API Client

| Task | Priority | Est. Hours |
|------|----------|------------|
| balldontlie client | P0 | 3h |
| Team schedule fetcher | P0 | 2h |
| Yahoo team mapping | P0 | 2h |
| Cache schedule data | P0 | 1h |

**Files to create:**
```
src/lib/nba/client.ts
src/lib/nba/types.ts
src/lib/nba/teamMapping.ts
src/app/api/nba/schedule/route.ts
```

#### Day 3-4: Schedule UI

| Task | Priority | Est. Hours |
|------|----------|------------|
| Games count badge | P0 | 2h |
| Schedule grid component | P1 | 4h |
| Week view | P1 | 3h |

**Files to create:**
```
src/components/schedule/ScheduleGrid.tsx
src/components/schedule/GamesCount.tsx
src/components/schedule/WeekView.tsx
```

#### Day 5: Integration

| Task | Priority | Est. Hours |
|------|----------|------------|
| Add to roster table | P0 | 2h |
| Add to dashboard | P0 | 2h |
| Testing | P0 | 2h |

### Sprint 4 Deliverables
- [ ] NBA schedule data available
- [ ] Games this week shown per player
- [ ] Schedule grid working
- [ ] Team-to-player mapping correct

---

## 🔲 Sprint 5: Streaming Planner (Week 5 - V1)

### Goals
- Free agent suggestions
- Streaming planner page
- Optimal lineup suggestions

### Tasks

#### Day 1-2: FA Analysis

| Task | Priority | Est. Hours |
|------|----------|------------|
| FA list fetcher | P0 | 2h |
| Games-based ranking | P0 | 3h |
| Category need analysis | P1 | 3h |

**Files to create:**
```
src/lib/analysis/streaming.ts
src/lib/analysis/categories.ts
src/app/api/yahoo/freeagents/route.ts
```

#### Day 3-4: Streaming UI

| Task | Priority | Est. Hours |
|------|----------|------------|
| Streamer list component | P0 | 3h |
| Streaming page | P0 | 3h |
| Off-day highlight | P1 | 2h |

**Files to create:**
```
src/app/streaming/page.tsx
src/components/streaming/StreamerList.tsx
src/components/streaming/StreamerCard.tsx
```

#### Day 5: Optimization

| Task | Priority | Est. Hours |
|------|----------|------------|
| Lineup optimizer (basic) | P1 | 4h |
| Testing | P0 | 2h |
| Documentation | P2 | 1h |

### Sprint 5 Deliverables
- [ ] FA list with games count
- [ ] Streaming suggestions
- [ ] Basic lineup optimizer
- [ ] **V1 COMPLETE** 🎉

---

## 🛠️ Technical Decisions

### State Management
- **Server State:** TanStack Query (React Query)
- **Client State:** Zustand (if needed)
- **Form State:** React Hook Form

### Styling
- **CSS Framework:** Tailwind CSS
- **Component Library:** shadcn/ui (optional)
- **Icons:** Lucide React

### Testing
- **Unit:** Vitest
- **E2E:** Playwright (if needed)
- **API:** Manual + curl

### Deployment
- **Platform:** Vercel
- **Domain:** fantastats.vercel.app
- **CI/CD:** Vercel Git integration

---

## 📦 Dependencies to Install

### Sprint 1
```bash
npm install next-auth
npm install @tanstack/react-query
```

### Sprint 2
```bash
npm install recharts          # Charts
npm install lucide-react      # Icons
npm install clsx              # Class utilities
npm install date-fns          # Date formatting
```

### Sprint 4
```bash
# No new deps needed (balldontlie is REST)
```

---

## 🔧 Environment Variables

### Current (.env.local)
```env
# Yahoo OAuth
YAHOO_CLIENT_ID=✅
YAHOO_CLIENT_SECRET=✅

# Yahoo redirect URIs must be HTTPS in many Yahoo apps.
# NextAuth's callback path is always:
#   /api/auth/callback/yahoo
# If Yahoo does not allow http://localhost redirects, test OAuth via:
# - your Vercel deployment (recommended), OR
# - an HTTPS tunnel with a stable URL.
YAHOO_REDIRECT_URI=✅

# NextAuth
NEXTAUTH_SECRET=🔲 needs generation
NEXTAUTH_URL=✅

# Upstash Redis
UPSTASH_REDIS_REST_URL=✅
UPSTASH_REDIS_REST_TOKEN=✅
```

### To Add (Sprint 4)
```env
# balldontlie API (Free Tier - 5 req/min)
BALLDONTLIE_API_KEY=your_api_key_here
```

> ⚠️ **Free Tier Limits:** 5 requests/minute. Cache aggressively!
> See [BALLDONTLIE_API.md](./BALLDONTLIE_API.md) for full documentation.

---

## 📊 Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Yahoo API rate limit | Medium | High | Aggressive caching |
| Yahoo API changes | Low | High | Abstract client layer |
| Auth token issues | Medium | Medium | Auto-refresh logic |
| balldontlie downtime | Low | Medium | Fallback/cached data |
| Scope creep | High | Medium | Strict sprint goals |

---

## ✅ Definition of Done

### For Features
- [ ] Code complete
- [ ] Types complete
- [ ] Error handling
- [ ] Loading states
- [ ] Mobile responsive
- [ ] Cached appropriately
- [ ] No TypeScript errors
- [ ] Manual testing done

### For Sprints
- [ ] All P0 tasks complete
- [ ] No critical bugs
- [ ] Pushed to GitHub
- [ ] Deployed to Vercel

---

## 🚀 Quick Start (Sprint 1)

After reading this document, start with:

```bash
# 1. Install Sprint 1 dependencies
cd fantastats
npm install next-auth @tanstack/react-query

# 2. Generate NEXTAUTH_SECRET
openssl rand -base64 32
# Add to .env.local

# 3. Start development
npm run dev
```

Then create files in this order:
1. `src/lib/auth.ts`
2. `src/app/api/auth/[...nextauth]/route.ts`
3. `src/lib/yahoo/types.ts`
4. `src/lib/yahoo/client.ts`
5. Test login flow

---

## 📞 Questions?

If stuck:
1. Check Yahoo API docs: https://developer.yahoo.com/fantasysports/guide/
2. Check NextAuth docs: https://next-auth.js.org/
3. Review this document
4. Ask for help!

---

**Let's build Fantastats! 🏀**
