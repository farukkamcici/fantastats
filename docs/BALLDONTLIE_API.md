# 🏀 BALLDONTLIE NBA API - Integration Guide

**API Version:** v1  
**Base URL:** `https://api.balldontlie.io/v1`  
**Plan:** Free Tier ($0/mo)  
**Documentation:** https://docs.balldontlie.io

---

## 📋 Account Tier: FREE

### Rate Limits
| Plan | Rate Limit | Monthly Cost |
|------|------------|--------------|
| **Free** | **5 req/min** | $0 |
| All-Star | 60 req/min | $9.99 |
| GOAT | 600 req/min | $39.99 |

### Available Endpoints (Free Tier)

| Endpoint | Available | Description |
|----------|-----------|-------------|
| ✅ Teams | Yes | All 30 NBA teams |
| ✅ Players | Yes | All players (historical + current) |
| ✅ Games | Yes | Game schedules and scores |
| ❌ Game Player Stats | No | Requires All-Star |
| ❌ Active Players | No | Requires All-Star |
| ❌ Player Injuries | No | Requires All-Star |
| ❌ Season Averages | No | Requires GOAT |
| ❌ Box Scores | No | Requires GOAT |
| ❌ Team Standings | No | Requires GOAT |

---

## 🔑 Authentication

API key required for ALL requests (even free tier).

**Get API Key:** https://app.balldontlie.io/signup

**Header Format:**
```
Authorization: YOUR_API_KEY
```

**Example:**
```bash
curl "https://api.balldontlie.io/v1/teams" \
  -H "Authorization: YOUR_API_KEY"
```

---

## 📡 Available Endpoints (Free Tier)

### 1. Teams

#### Get All Teams
```
GET /teams
```

**Query Parameters:**
| Param | Required | Description |
|-------|----------|-------------|
| division | No | Filter by division (Southeast, Atlantic, etc.) |
| conference | No | Filter by conference (East, West) |

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "conference": "East",
      "division": "Southeast",
      "city": "Atlanta",
      "name": "Hawks",
      "full_name": "Atlanta Hawks",
      "abbreviation": "ATL"
    }
  ]
}
```

#### Get Specific Team
```
GET /teams/<ID>
```

---

### 2. Players

#### Get All Players
```
GET /players
```

**Query Parameters:**
| Param | Required | Description |
|-------|----------|-------------|
| cursor | No | Pagination cursor |
| per_page | No | Results per page (max 100, default 25) |
| search | No | Search by first or last name |
| first_name | No | Filter by first name |
| last_name | No | Filter by last name |
| team_ids[] | No | Filter by team IDs (array) |
| player_ids[] | No | Filter by player IDs (array) |

**Response:**
```json
{
  "data": [
    {
      "id": 19,
      "first_name": "Stephen",
      "last_name": "Curry",
      "position": "G",
      "height": "6-2",
      "weight": "185",
      "jersey_number": "30",
      "college": "Davidson",
      "country": "USA",
      "draft_year": 2009,
      "draft_round": 1,
      "draft_number": 7,
      "team": {
        "id": 10,
        "conference": "West",
        "division": "Pacific",
        "city": "Golden State",
        "name": "Warriors",
        "full_name": "Golden State Warriors",
        "abbreviation": "GSW"
      }
    }
  ],
  "meta": {
    "next_cursor": 25,
    "per_page": 25
  }
}
```

#### Get Specific Player
```
GET /players/<ID>
```

---

### 3. Games (⭐ Most Important for Us)

#### Get All Games
```
GET /games
```

**Query Parameters:**
| Param | Required | Description |
|-------|----------|-------------|
| cursor | No | Pagination cursor |
| per_page | No | Results per page (max 100) |
| dates[] | No | Filter by dates (YYYY-MM-DD format, array) |
| seasons[] | No | Filter by seasons (e.g., 2024 for 2024-25) |
| team_ids[] | No | Filter by team IDs (array) |
| postseason | No | true = playoffs only, false = regular season |
| start_date | No | Games on or after this date (YYYY-MM-DD) |
| end_date | No | Games on or before this date (YYYY-MM-DD) |

**Response:**
```json
{
  "data": [
    {
      "id": 15907925,
      "date": "2025-01-05",
      "season": 2024,
      "status": "Final",
      "period": 4,
      "time": "Final",
      "postseason": false,
      "home_team_score": 115,
      "visitor_team_score": 105,
      "datetime": "2025-01-05T23:00:00.000Z",
      "home_team": {
        "id": 6,
        "conference": "East",
        "division": "Central",
        "city": "Cleveland",
        "name": "Cavaliers",
        "full_name": "Cleveland Cavaliers",
        "abbreviation": "CLE"
      },
      "visitor_team": {
        "id": 4,
        "conference": "East",
        "division": "Southeast",
        "city": "Charlotte",
        "name": "Hornets",
        "full_name": "Charlotte Hornets",
        "abbreviation": "CHA"
      }
    }
  ],
  "meta": {
    "next_cursor": 25,
    "per_page": 25
  }
}
```

**Game Status Values:**
| Status | Description |
|--------|-------------|
| `{time}` (e.g., "7:00 pm ET") | Game not started |
| `1st Qtr` | First quarter |
| `2nd Qtr` | Second quarter |
| `Halftime` | Halftime |
| `3rd Qtr` | Third quarter |
| `4th Qtr` | Fourth quarter |
| `Final` | Game completed |

#### Get Specific Game
```
GET /games/<ID>
```

---

## 🔄 Pagination

balldontlie uses **cursor-based pagination** (not offset).

**Response Meta:**
```json
{
  "meta": {
    "next_cursor": 90,
    "per_page": 25
  }
}
```

**Get Next Page:**
```
GET /games?cursor=90
```

---

## ⚠️ Error Codes

| Code | Description |
|------|-------------|
| 401 | Unauthorized - Invalid API key |
| 400 | Bad Request - Invalid parameters |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - **Rate limited (5 req/min)** |
| 500 | Server Error |
| 503 | Service Unavailable |

---

## 🎯 Our Use Cases

### Use Case 1: Get Games This Week for a Team

**Purpose:** Show how many games a player's team has this week

```typescript
// Get Lakers games for this week
const startDate = '2025-01-06'; // Monday
const endDate = '2025-01-12';   // Sunday

const response = await fetch(
  `https://api.balldontlie.io/v1/games?team_ids[]=14&start_date=${startDate}&end_date=${endDate}`,
  { headers: { 'Authorization': API_KEY } }
);
```

### Use Case 2: Get All Games for a Week

**Purpose:** Build weekly schedule grid

```typescript
// Get all NBA games this week
const response = await fetch(
  `https://api.balldontlie.io/v1/games?start_date=2025-01-06&end_date=2025-01-12&per_page=100`,
  { headers: { 'Authorization': API_KEY } }
);
```

### Use Case 3: Search Player

**Purpose:** Find player by name

```typescript
// Search for "LeBron"
const response = await fetch(
  `https://api.balldontlie.io/v1/players?search=lebron`,
  { headers: { 'Authorization': API_KEY } }
);
```

---

## 🗺️ Team ID Reference

| ID | Team | Abbreviation |
|----|------|--------------|
| 1 | Atlanta Hawks | ATL |
| 2 | Boston Celtics | BOS |
| 3 | Brooklyn Nets | BKN |
| 4 | Charlotte Hornets | CHA |
| 5 | Chicago Bulls | CHI |
| 6 | Cleveland Cavaliers | CLE |
| 7 | Dallas Mavericks | DAL |
| 8 | Denver Nuggets | DEN |
| 9 | Detroit Pistons | DET |
| 10 | Golden State Warriors | GSW |
| 11 | Houston Rockets | HOU |
| 12 | Indiana Pacers | IND |
| 13 | LA Clippers | LAC |
| 14 | Los Angeles Lakers | LAL |
| 15 | Memphis Grizzlies | MEM |
| 16 | Miami Heat | MIA |
| 17 | Milwaukee Bucks | MIL |
| 18 | Minnesota Timberwolves | MIN |
| 19 | New Orleans Pelicans | NOP |
| 20 | New York Knicks | NYK |
| 21 | Oklahoma City Thunder | OKC |
| 22 | Orlando Magic | ORL |
| 23 | Philadelphia 76ers | PHI |
| 24 | Phoenix Suns | PHX |
| 25 | Portland Trail Blazers | POR |
| 26 | Sacramento Kings | SAC |
| 27 | San Antonio Spurs | SAS |
| 28 | Toronto Raptors | TOR |
| 29 | Utah Jazz | UTA |
| 30 | Washington Wizards | WAS |

---

## 🔧 Implementation Plan

### Environment Variable
```env
# .env.local
BALLDONTLIE_API_KEY=your_api_key_here
```

### Client Library Structure

```
src/lib/nba/
├── client.ts          # API client
├── types.ts           # TypeScript types
├── teamMapping.ts     # Yahoo team name → balldontlie ID
└── cache.ts           # Cache helpers
```

### Caching Strategy (Critical for 5 req/min!)

| Data Type | Cache TTL | Reason |
|-----------|-----------|--------|
| Teams | 24 hours | Rarely changes |
| Players | 24 hours | Rarely changes mid-season |
| Games (future) | 1 hour | Schedule is stable |
| Games (today) | 5 minutes | For live scores |

### Rate Limit Management

```typescript
// 5 requests per minute = 1 request per 12 seconds
// Batch requests and cache aggressively!

class RateLimiter {
  private lastRequest = 0;
  private minInterval = 12000; // 12 seconds

  async throttle() {
    const now = Date.now();
    const elapsed = now - this.lastRequest;
    if (elapsed < this.minInterval) {
      await sleep(this.minInterval - elapsed);
    }
    this.lastRequest = Date.now();
  }
}
```

---

## 📊 Yahoo → balldontlie Team Mapping

To connect Yahoo Fantasy players to balldontlie schedule data:

```typescript
// Yahoo uses team names like "LAL", "GSW"
// balldontlie uses team IDs

const YAHOO_TO_BALLDONTLIE: Record<string, number> = {
  'ATL': 1,
  'BOS': 2,
  'BKN': 3,
  'CHA': 4,
  'CHI': 5,
  'CLE': 6,
  'DAL': 7,
  'DEN': 8,
  'DET': 9,
  'GSW': 10,
  'HOU': 11,
  'IND': 12,
  'LAC': 13,
  'LAL': 14,
  'MEM': 15,
  'MIA': 16,
  'MIL': 17,
  'MIN': 18,
  'NOP': 19,
  'NYK': 20,
  'OKC': 21,
  'ORL': 22,
  'PHI': 23,
  'PHX': 24,
  'POR': 25,
  'SAC': 26,
  'SAS': 27,
  'TOR': 28,
  'UTA': 29,
  'WAS': 30,
};
```

---

## ✅ Free Tier Limitations & Workarounds

### What We CAN'T Do (Free Tier)
- ❌ Get player stats per game
- ❌ Get active roster only
- ❌ Get injury reports
- ❌ Get season averages
- ❌ Get live box scores

### Workarounds
| Need | Solution |
|------|----------|
| Player stats | Use Yahoo Fantasy API (we have it!) |
| Active players | Filter by `team` field existence |
| Injuries | Use Yahoo Fantasy API injury status |
| Season averages | Calculate from Yahoo stats |

### What We CAN Do Well
- ✅ Get weekly game schedule per team
- ✅ Count games this week for streaming
- ✅ Show which days teams play
- ✅ Identify back-to-back games
- ✅ Plan streaming pickups by schedule

---

## 🚀 Quick Test

```bash
# Test the API (replace YOUR_API_KEY)
curl "https://api.balldontlie.io/v1/teams" \
  -H "Authorization: YOUR_API_KEY"

# Get Lakers games this week
curl "https://api.balldontlie.io/v1/games?team_ids[]=14&start_date=2025-01-06&end_date=2025-01-12" \
  -H "Authorization: YOUR_API_KEY"
```

---

## 📚 Resources

- **API Docs:** https://docs.balldontlie.io
- **Sign Up:** https://app.balldontlie.io/signup
- **OpenAPI Spec:** https://www.balldontlie.io/openapi.yml
- **GitHub (SDK):** https://github.com/balldontlie-api/typescript

---

**Note:** Free tier is sufficient for our use case (schedule data only). Yahoo Fantasy API provides all player stats we need. balldontlie just fills the gap for NBA schedule data that Yahoo doesn't provide.
