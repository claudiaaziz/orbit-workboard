# Orbit Provider Workboard

## Tools used

- Cursor Agent / Ask / Prompt modes for implementation, refactoring, and review loops
- ChatGPT for quick syntax translation, React Native / Expo API explanations, and walkthroughs for unfamiliar native flows like accelerometer-based motion detection

## How I used coding agents

I used coding agents heavily throughout this take-home because of the time constraint. Having the agent generate a first pass while I reviewed, tested, and iterated was the only practical way to cover the full scope.

I treated the agent as an implementation partner, not as an unchecked code generator. The most useful workflow was giving the agent one narrow requirement section at a time, pointing it at existing project files, and asking it to stay within the current architecture instead of inventing a larger system.

I worked section by section, reviewed the generated code, and asked follow-ups when something looked overengineered, unclear, or under-tested. For example, I asked why certain memoization was needed, removed it when it felt unnecessary, and added tests where the business logic felt risky.

## Prompts and instructions that worked well

- Quoting the exact requirement section and asking for “no extras”
- Pointing the agent at an existing file to copy patterns from before generating a new flow
- Asking the agent to explain unfamiliar native code before I accepted it
- Asking the agent to keep business logic in domain files and avoid mixing React Native APIs into pure logic
- Asking the agent to review against the assignment checklist and mark anything incomplete

## Generated outputs I rejected or rewrote

- Adjusted generic/dev wording into more useful product wording
- Avoided over-optimizing small-list callbacks before there was a profiling reason
- Rejected or trimmed abstractions that made the take-home harder to review

## Bugs and review issues I caught

- `pnpm add expo-sensors` installed the wrong version for Expo SDK 54 and caused a runtime crash; I fixed it by using `npx expo install expo-sensors`
- While manually testing, I caught that swiping down the asset scan modal returned to the visit modal instead of the site detail modal; I adjusted the close behavior
- Completion needed to stay blocked until required evidence were satisfied
- Little UI things that are faster to just fix myself

## Work I handled directly

- Decided where generated code was too broad and trimmed it back to the assignment scope
- Reviewed the native permission/fallback flows and adjusted them for simulator-friendly behavior, including the dev scan input
- Reviewed generated code across the workboard, sheet, native-flow, domain, analytics, and test layers
- Made final tradeoff decisions around what to finish vs. document as a known gap

## Tradeoffs I made to stay within the timebox

- Chose a stale workboard banner for §10 instead of building full offline sync or an upload retry queue
- Chose metadata capture for §9 instead of GPS 
- Only manually tested on iOS using Expo Go, no andriod

## What I would ask an agent to do next if I had another hour

- Finish the upload flow so evidence can move through `queued`, `uploading`, `uploaded`, and `failed` in the live app, not just in labels/fixtures
- Add a retry failed upload action
- Wire the `evidence_upload_failed` analytics event where upload failure is simulated
