# Orbit Provider Workboard

## Tools used

- Cursor Agent / Ask / Prompt modes for implementation, refactoring, and review loops
- ChatGPT for quick syntax translation, React Native / Expo API explanations, and walkthroughs for unfamiliar native flows like accelerometer-based motion detection

## How I used coding agents

I used coding agents heavily throughout this take-home because of the time constraint. Having the agent generate first passes while I reviewed, tested, and iterated was the only practical way to cover the assignment scope within the timebox.

I treated the agent as an implementation partner, not as an unchecked code generator. The most useful workflow was giving the agent one narrow requirement section at a time, pointing it at existing project files, and asking it to stay within the current architecture instead of inventing a larger system.

I worked section by section, reviewed the generated code, and asked follow-ups when something looked overengineered, unclear, or under-tested. For example, I asked why certain memoization was needed, removed it when it felt unnecessary, and added tests where the business logic felt risky.

## Prompts and instructions that worked well

- Quoting the exact requirement section and asking for “no extras”
- Pointing the agent at an existing file to copy patterns from before generating a new flow
- Asking the agent to explain unfamiliar native code before I accepted it
- Asking the agent to keep business logic in domain files and avoid mixing React Native APIs into pure logic
- Asking the agent to review against the assignment checklist and mark anything incomplete

## Generated outputs I rejected or rewrote

- Rewrote generic placeholder UI copy into more operational/product-oriented language for field technicians
- Avoided over-optimizing small-list callbacks before there was a profiling reason
- Rejected or trimmed abstractions that made the take-home harder to review

## Bugs and review issues I caught

- While manually testing, I caught that swiping down the asset scan modal returned to the visit modal instead of the site detail modal; I adjusted the close behavior
- When I tapped `mark_en_route` with list filters active (e.g. work status **Scheduled**), the open sheet cleared all site/visit info and would not let me drag the modal down to dismiss. Cause: site and visit detail models were built from `filteredSites`, but the action moved the site’s `workStatus` (e.g. `scheduled` → `in_progress`), so the site dropped out of the filtered list while the modals were still open and nested sheets tore down badly. Fix: `useWorkboardSheets` now resolves sheet models from the full `sites` store; filters still apply only to the workboard list.

## Work I handled directly

- Decided where generated code was too broad and trimmed it back to the assignment scope
- Reviewed the native permission/fallback flows and adjusted them for simulator-friendly behavior, including the dev scan input
- Reviewed generated code across UI, sheet presentation flows, native integrations, domain logic, analytics instrumentation, and tests
- Made final tradeoff decisions around what to finish vs. document as a known gap

## Tradeoffs I made to stay within the timebox

- Chose a stale workboard banner for §10 instead of building full offline sync or an upload retry queue
- Chose metadata capture for §9 instead of GPS 
- Only manually tested on iOS using Expo Go, not on Android

## What I would ask an agent to do next if I had another hour

- Finish the upload flow so evidence can move through `queued`, `uploading`, `uploaded`, and `failed` in the live app, not just in labels/fixtures
- Add a retry failed upload action
- Wire the `evidence_upload_failed` analytics event where upload failure is simulated
