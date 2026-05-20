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

