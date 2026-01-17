# Fantastats TODOs

This kanban board maps to `fantastats/docs/DEVELOPMENT_PLAN.md` and current issues observed in the UI.

## Backlog
-add export and copy to clippboard for FA table , give option for 50-100-200 players 
-add better algo for streaming option for what to need for current matchup 
-make it sortable for RGTW col and make the columns for the "remainig " game count not hte total count for the week , calculate it in roster table 
-is it reasonable to create avg stats using GP for season stats so wecan serve Season (AVG) stats to FA table
-make schedule tab like rows are teams, columns are weeks and values are ttoal game counts for the team in the week and highligt the current week column make it well ui 
-add multiple sort algo in fa table for example we first sorted by rgtw and there are lots of 1 rgtw players so we sorted than 3ptm it should sort the plaers first for rtgw and 3ptm for tiebraker it shuld continue like that and it should remove the sorting spesificaly wehn ckicked to off the columns sorting 
-create a compund sorting mechnaism that sorts for for exampkle in total of steal and block or total of fg% + ft% so this will be the logic so player can say i need better ft and better 3ptm player so lets search and find a plyer who does them both good by sorting with total 



## In Progress
- [ ] None.

## Blocked
- [ ] None.

## Done
- [x] NextAuth Yahoo provider wired (`fantastats/src/lib/auth.ts`, `fantastats/src/app/api/auth`).
- [x] Yahoo client + types present (`fantastats/src/lib/yahoo`).
- [x] Core Yahoo API routes (leagues, team, roster).
- [x] Dashboard shell + league selector (`fantastats/src/app/dashboard`).
- [x] Matchups view shell (`fantastats/src/app/dashboard/[leagueKey]/matchups`).
- [x] Standings view shell (`fantastats/src/app/dashboard/[leagueKey]/standings`).
- [x] Team roster view shell (`fantastats/src/app/dashboard/[leagueKey]/team`).
- [x] Align header/user menu with design tokens.
- [x] Replace undefined background tokens with design tokens.
- [x] [P0][S1] Fix scoreboard parsing so matchup details populate from `/league/{leagueKey}/scoreboard` (validate `parseScoreboardResponse` in `fantastats/src/lib/yahoo/client.ts`).
- [x] [P0][S2] Fix matchup tab details by verifying `/team/{teamKey}/matchups` parsing in `parseMatchupsResponse` and `getMyMatchup`.
- [x] [P0][S3] Fix team screen empty state by validating `getMyTeam` + `getRoster` parsing paths and `SimplifiedPlayer` mapping for roster responses.
- [x] [P0][S4] Fix standings stats by using `getStandings` and updating `fantastats/src/app/dashboard/[leagueKey]/standings/page.tsx`.
- [x] [P1][S5] Transactions tab: UI with `/api/yahoo/leagues/[leagueKey]/transactions`, filters, pagination.
- [x] [P1][S6] Free agents tab: UI with `/api/yahoo/leagues/[leagueKey]/players`, search, filters, pagination.
- [x] [P1][S7] Integrate balldontlie API client (`fantastats/src/lib/nba/client.ts`) and schedule API route (`fantastats/src/app/api/nba/schedule/route.ts`).
- [x] [P1][S8] Add NBA team mapping (`fantastats/src/lib/nba/teamMapping.ts`) to connect Yahoo teams to balldontlie IDs.
- [x] [P1][S9] Schedule tab: NBA schedule grid + games-per-week indicators on roster.
- [x] [P1][S10] Add loading/empty/error states for matchups, standings, team roster, and new tabs.
- [x] [P1][S11] Add smoke checks script via `npm run inspect:yahoo`.
- [x] [P1][S12] CSV export API + UI (`fantastats/src/app/api/export/csv/route.ts`, `fantastats/src/components/export/ExportButton.tsx`).
- [x] [P2][S13] Error boundary + 404 page + empty states polish for MVP readiness.
- [x] [P1][S14] Mobile responsive pass across dashboard and tabs.
- [x] [P2][S15] Streaming analysis core (`fantastats/src/lib/analysis/streaming.ts`, `fantastats/src/lib/analysis/categories.ts`).
- [x] [P2][S16] Streaming UI (`fantastats/src/components/streaming/StreamerList.tsx`, `fantastats/src/components/streaming/StreamerCard.tsx`).
- [x] [P2][S17] Lineup optimizer (basic) for weekly suggestions.
