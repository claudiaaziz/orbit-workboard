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

Visit actions succeed by default. The hook passes its `workboardContext` into `performVisitAction` so API eligibility matches the UI. To demo the error banner and retry flow, call `performVisitAction` with `simulateFailure: true` (see `data/mockApi.ts`).

### Camera evidence (§6)

- Open a visit that requires proof (e.g. **site-edge-001** → **visit-site-edge-001-2**).
- Tap **Capture evidence photo** → allow camera when prompted → **Take photo** → **Use photo**.
- Checklist turns complete; **Complete visit** can unlock after you are on site with scan/motion satisfied.
- **Retake photo** reopens the camera overlay.
- On simulator or if permission is denied: **Use placeholder photo (simulator / dev)** saves bundled placeholder evidence (documented fallback per spec).

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
I used a small local async resource layer instead of TanStack Query to keep the take-home focused. The API boundary is still isolated, so replacing the hook with TanStack Query later would be straightforward.
little ui things like showing 22 out of 24 etc
I kept state coordination in the useWorkboardSites view model and passed state/callbacks into presentational sheets. I considered context, but the flow is only two sheet layers deep, so explicit props kept the data flow easier to trace for the take-home.