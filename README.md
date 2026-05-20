# Orbit Provider Workboard

Expo React Native TypeScript app for the **Provider Workboard** take-home (Orbit Field Services).

## Prerequisites

- **Node** ≥ 20.19.4 ([`.nvmrc`](./.nvmrc) pins 22)
- **pnpm** 10+ (`corepack enable` or `npm install -g pnpm`)

## Commands (take-home validation)

```bash
cd orbit-workboard
nvm use
pnpm install
pnpm start
```

| Command | Purpose |
|---------|---------|
| `pnpm start` | Expo dev server |
| `pnpm typecheck` | TypeScript |
| `pnpm lint` | ESLint via Expo |
| `pnpm test` | Jest (domain logic) |

### Adding dependencies

Use **pnpm** for installs and **Expo** for native/SDK-aligned versions:

```bash
pnpm install                    # sync lockfile after pull
pnpm exec expo install <pkg>    # Expo-compatible native modules
pnpm add <pkg>                  # non-native JS libs (e.g. zod, @tanstack/react-query)
```

## Tech baseline (from take-home)

| Area | Choice | Status |
|------|--------|--------|
| Runtime | Expo SDK 54 + React Native + TypeScript | In use |
| Package manager | pnpm | In use |
| Navigation | Expo Router | Planned |
| Server state | TanStack Query | Planned (mock API ready) |
| Validation | Zod | Planned |
| Icons | Lucide React Native | Planned |
| Camera / scan | `expo-camera` | Planned |
| Motion | `expo-sensors` | Planned |
| Location | `expo-location` | Planned |
| Persistence | AsyncStorage / FileSystem | Planned |
| Haptics | `expo-haptics` | Planned |
| Tests | Jest + `jest-expo` (domain only) | Started |
| API | Local mock layer (`data/mockApi.ts`) | In use |

## Project structure

```text
src/features/providerWorkboard/
  components/     # Presentational UI
  data/           # Mock seed data + async API boundary
  domain/         # Pure business logic (no React imports)
  native/         # Camera, sensors, persistence (upcoming)
  screens/
  viewModels/
  analytics.ts
  types.ts
```


what i changed from ai
i dont know if i like these bc these should just be in like a cursor rule general for any project
“I skipped useCallback because the list is small and I can add it if profiling shows a problem
it was exporting types that werent used in other componenets 
I used TanStack Query because the assignment asked us to structure mock data like real API integration would follow. Even though the API is mocked, it gives me loading, error, refresh, and mutation states in a way that can be replaced with real endpoints later.

3. Empty state wording is VERY good

This:

Pull down to refresh. If you expected sites here, try again in a moment.

actually sounds product-minded.

Keep that energy. bbfore it was v generic and not ui friendly

if had more time would look into using a ui library this would require research since i havent used a library in react native before so i dont know the common ones but from my little research react native paper not only speeds up dev time but it makes sure ur styling is somewhat uniform
but for this project i wanted to use the native elements to make it easy to review for yall i rly decided to let cursor do all the styling so i can focus on the functionality here (dk if i should say this)
statemanangent as the app got bigger 
