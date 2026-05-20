# React Native Engineer Take-Home

## Overview

This take-home evaluates how you build a robust React Native feature in an AI-native engineering environment.

The assignment is intentionally broader than a traditional take-home. A strong submission is not expected to be hand-coded line by line. We expect you to use coding agents for exploration, implementation, refactoring, testing, and review. The work is designed to be difficult to complete well in a reasonable amount of time without agents.

Expected time with coding agents: **4-6 focused hours**.
Expected time without coding agents: **not reasonable**.

We are not testing typing speed. We are testing product judgment, React Native execution, agent orchestration, code review discipline, and your ability to turn generated work into software you can defend.

## Scenario

You are building a mobile workflow for **Orbit Field Services**, a fictional marketplace that coordinates service providers who maintain equipment across many customer sites.

Providers need a mobile app that helps them:

- See active service programs across sites.
- Understand which visits need attention today.
- Inspect individual visits.
- Capture field evidence using device hardware.
- Verify equipment with camera-based scanning.
- Detect rough handling or unsafe movement using device sensors.
- Take common provider actions from the field.
- Recover gracefully from offline or failed requests.

This is not meant to replicate any real production app. Use the domain as a realistic backdrop for mobile product decisions.

## Product Goal

Build a React Native feature called **Provider Workboard**.

The workboard should let a field provider quickly answer:

1. What sites need my attention?
2. Which visits are scheduled, blocked, late, or complete?
3. Have I captured the required proof for this visit?
4. Did I verify the correct equipment?
5. Did the app detect any device movement or handling concerns?
6. What changed after I took an action?

Use mock data and mocked async mutations, but structure the code as if real API integration will follow.

## Requirements Summary

Your implementation should include:

1. A virtualized workboard list.
2. Search, status filters, and date scope filters.
3. Pull-to-refresh.
4. A site/program detail bottom sheet.
5. A nested visit detail sheet.
6. Camera-based evidence capture.
7. Barcode or QR scan verification.
8. Accelerometer-based motion check.
9. At least three visit actions.
10. Offline/degraded handling for captured evidence.
11. Shared or pure domain logic separated from UI.
12. Analytics instrumentation for key user actions.
13. Targeted tests for the highest-risk business logic.
14. An `AGENT_LOG.md` explaining how you used coding agents.

## Suggested Tech Baseline

Use React Native with TypeScript. Expo is fine and preferred if you are starting from scratch.

You may use common libraries where they make the app better:

- React Native primitives.
- Expo.
- React Navigation or Expo Router.
- TanStack Query or a small local async state layer.
- Expo Camera or a comparable camera/scanner library.
- Expo Sensors or a comparable accelerometer API.
- Expo Location or a comparable location API.
- Expo FileSystem, SQLite, AsyncStorage, or another local persistence layer.
- Expo Haptics or a comparable native haptics API.
- Zod or another validation library.
- Lucide React Native or another consistent icon set.
- Jest or Vitest for pure logic tests.

Do not spend time on a backend. Mock the API locally.

## Data Model

You may adjust fields if your implementation needs to, but your app should support this general shape.

```ts
type WorkStatus =
  | "needs_attention"
  | "scheduled"
  | "in_progress"
  | "blocked"
  | "completed";

type VisitStatus =
  | "scheduled"
  | "confirmed"
  | "en_route"
  | "on_site"
  | "blocked"
  | "completed"
  | "cancelled";

type ServiceVisit = {
  id: string;
  siteId: string;
  status: VisitStatus;
  serviceType: "inspection" | "repair" | "swap" | "pickup" | "delivery";
  scheduledStart: string; // ISO timestamp
  scheduledEnd: string; // ISO timestamp
  assignedTech?: string;
  equipmentLabel: string;
  expectedAssetCode: string;
  evidenceRequired: boolean;
  motionCheckRequired: boolean;
  locationRequired: boolean;
  issueSummary?: string;
  blockedReason?: string;
  lastUpdatedAt: string; // ISO timestamp
};

type VisitEvidence = {
  id: string;
  visitId: string;
  type: "arrival_photo" | "completion_photo" | "damage_photo";
  localUri: string;
  capturedAt: string; // ISO timestamp
  latitude?: number;
  longitude?: number;
  uploadStatus: "queued" | "uploading" | "uploaded" | "failed";
};

type AssetScan = {
  visitId: string;
  expectedAssetCode: string;
  scannedAssetCode: string;
  result: "match" | "mismatch";
  scannedAt: string; // ISO timestamp
};

type MotionSample = {
  visitId: string;
  startedAt: string; // ISO timestamp
  completedAt: string; // ISO timestamp
  maxAccelerationG: number;
  result: "stable" | "rough_motion_detected";
};

type ServiceSite = {
  id: string;
  customerName: string;
  siteName: string;
  address: {
    line1: string;
    city: string;
    region: string;
    postalCode: string;
  };
  workStatus: WorkStatus;
  priority: "normal" | "high" | "urgent";
  visits: ServiceVisit[];
  contactName: string;
  contactPhone: string;
};
```

Seed at least 20 sites and at least 60 visits across mixed statuses, dates, priorities, hardware requirements, and edge cases. Include enough data to make filtering, empty states, required-evidence states, scan mismatches, and summary logic meaningful.

## Functional Requirements

### 1. Workboard List

Create a primary mobile screen that displays service sites in a virtualized list.

Each row should show:

- Site name.
- Customer name.
- City/region or compact address.
- Priority.
- Current work status.
- Next visit time.
- A compact count summary of visits by status.
- A compact count of required evidence still missing.
- A visual indication when a site is late, blocked, urgent, or waiting on proof capture.

The list must support:

- Text search across site name, customer name, address, and equipment labels.
- Status filtering.
- Date scope filtering: `Today`, `Next 7 days`, `All`.
- Evidence filtering: `Missing proof`, `Scan mismatch`, `Ready to complete`.
- Pull-to-refresh.
- Loading state.
- Error state with retry.
- Empty state for no matching results.

Use `FlatList` or `SectionList`. Do not use `ScrollView` plus `.map()` for the main list.

### 2. Summary Header

Above the list, show a compact operational summary derived from the current filtered data:

- Total matching sites.
- Visits due today.
- Blocked visits.
- Urgent sites.
- Visits missing required evidence.
- Failed or queued uploads.

This summary should update when filters change.

### 3. Site Detail Sheet

Tapping a site opens a bottom sheet-style detail surface.

The sheet should show:

- Site and customer header.
- Address and contact details.
- Status sentence written in plain language.
- Next visit.
- Visit timeline/list.
- Site-level warnings, such as blocked or overdue work.
- Evidence completion summary.
- Hardware permission warnings relevant to visits at the site.

The sheet must:

- Include an explicit close button.
- Respect safe areas.
- Keep content scrollable inside the sheet.
- Preserve list scroll position and filter state when dismissed.

Use a native modal or platform-appropriate sheet. If you use React Native `Modal`, prefer `presentationStyle="pageSheet"` on iOS.

### 4. Visit Detail Sheet

Tapping a visit inside the site detail opens a second detail surface for that visit.

The visit detail should show:

- Visit status.
- Service type.
- Equipment label.
- Scheduled time window.
- Assigned technician, if present.
- Issue or blocked reason, if present.
- Last updated timestamp.
- Evidence checklist.
- Asset scan result.
- Motion check result.
- Capture/upload status.
- Available actions.

This second sheet should be opened from inside the site detail flow. Avoid global modal placement that would break stacked presentation behavior on iOS.

### 5. Visit Actions

Implement at least three visit actions. At least one action must require successful native capture before it becomes available.

Examples:

- Confirm visit.
- Mark en route.
- Mark on site.
- Complete visit.
- Report blocked.
- Request reschedule.
- Cancel visit.
- Queue evidence upload.
- Retry failed upload.

Actions may update local mock data, but they must behave like real async mutations:

- Show pending state for the action being performed.
- Disable conflicting actions while pending.
- Simulate success and failure paths.
- Update derived summaries after success.
- Show an error message after failure.
- Use confirmation for destructive or high-impact actions.
- Keep action availability tied to the visit status.
- Keep action availability tied to required evidence, scan verification, and motion checks where applicable.

For example, `Complete visit` should not be available for a cancelled visit, and `Mark en route` should not be available after completion.

### 6. Camera Evidence Capture

Implement a camera flow for visit evidence.

The flow should support:

- Requesting camera permission.
- Handling denied permission with a useful recovery state.
- Capturing at least one photo tied to a visit.
- Previewing the captured photo.
- Retaking the photo.
- Saving the photo locally or storing a local URI in app state.
- Marking the evidence as queued, uploaded, or failed.
- Displaying captured evidence in the visit detail.

At least one visit should require an arrival or completion photo before it can be completed.

If your development environment cannot use a physical camera, provide a fallback path that simulates capture while preserving the same state model and UI states. Document the fallback clearly.

### 7. Barcode or QR Scan Verification

Implement an asset verification flow using the camera scanner.

The flow should:

- Request the necessary camera permission.
- Scan a barcode or QR value.
- Compare the scanned value to `expectedAssetCode`.
- Show match and mismatch states.
- Prevent or warn on completion when the wrong asset was scanned.
- Allow rescanning.

If camera scanning is unavailable in your environment, include a manual simulated scan input behind a clearly labeled development fallback.

### 8. Accelerometer Motion Check

Implement a short motion check using accelerometer data.

The flow should:

- Subscribe to accelerometer updates only while the check is active.
- Show live progress for a short capture window, such as 3-5 seconds.
- Derive a `maxAccelerationG` or similar stability metric.
- Classify the result as `stable` or `rough_motion_detected`.
- Store the result on the visit.
- Clean up sensor subscriptions when the screen or sheet closes.

Use this as a fictional "equipment handling stability check." It does not need scientific precision, but the logic should be explicit and testable.

### 9. Location and Metadata Capture

Add location or metadata capture for evidence. Choose one:

- Request foreground location permission and attach approximate coordinates to captured evidence.
- Attach device orientation, timestamp, and motion summary to captured evidence.
- Attach a manually entered note plus timestamp when location permission is denied.

The app should not fail silently if permission is denied. Show a degraded but usable path.

### 10. Offline or Degraded State

Add one degraded-network behavior. Choose one:

- Offline banner with upload-only actions disabled.
- Retry queue for failed evidence uploads.
- Last-refreshed timestamp with stale data warning.
- Mutation rollback after simulated failure.
- Local evidence queue that survives screen navigation.

Keep this pragmatic. We are looking for sound product behavior, not a full sync engine.

### 11. Native Permission States

Handle permission states as part of the product, not as incidental errors.

At minimum, cover:

- Camera permission unknown, granted, and denied.
- Sensor unavailable or unsupported.
- Location permission denied if you choose location capture.
- A path back to settings or a clear fallback when a permission blocks the ideal flow.

### 12. Analytics

Instrument meaningful user actions with a small analytics abstraction.

Track at least:

- Workboard viewed.
- Search changed or submitted.
- Filter changed.
- Site opened.
- Visit opened.
- Visit action started.
- Visit action completed.
- Visit action failed.
- Refresh triggered.
- Camera permission requested.
- Evidence photo captured.
- Evidence retaken.
- Asset scan completed.
- Asset scan mismatch.
- Motion check started.
- Motion check completed.
- Evidence upload queued.
- Evidence upload failed.

Analytics payloads should use consistent property names and stable enum-like values. Console logging is acceptable for the transport, but the call sites should look like production instrumentation.

### 13. Pure Domain Logic

Separate platform-agnostic logic from UI. This may live in a `domain/`, `shared/`, or `utils/` module.

At minimum, pure logic should cover:

- Filtering and searching sites.
- Date-scope matching.
- Deriving site summaries.
- Visit action eligibility.
- Visit status transitions.
- Human-readable status sentences.
- Evidence checklist completion.
- Asset scan match/mismatch classification.
- Motion sample classification from accelerometer readings.
- Completion readiness from status, evidence, scan, and motion state.

This code should not import React or React Native.

### 14. Tests

Add focused tests for the riskiest pure logic.

Minimum coverage:

- Search and filter behavior.
- Date-scope behavior.
- Visit action eligibility.
- Status transition behavior.
- At least one edge case involving blocked, cancelled, overdue, or completed visits.
- Evidence checklist completion.
- Scan mismatch behavior.
- Motion classification thresholds.
- Completion readiness when native capture requirements are missing.

Do not spend the whole assignment building a test harness. A small, meaningful pure-logic test suite is enough.

## UX Requirements

The app should feel like a native mobile operations tool, not a shrunken desktop table.

Required UX behavior:

- Use native React Native primitives.
- Use `Pressable` or equivalent with visible pressed states.
- Keep touch targets at least 44 x 44 points.
- Respect safe areas.
- Support long lists without scroll jank.
- Show loading, error, empty, pending, disabled, and success states.
- Show camera, scanner, sensor, and permission states clearly.
- Start and stop sensors intentionally so battery use is bounded.
- Provide clear retake, rescan, retry, and fallback paths.
- Use accessible labels and roles for interactive elements.
- Provide accessible alternatives for camera-dependent flows where practical.
- Avoid hidden navigation for primary workflows.
- Avoid stacking more than two modal/sheet layers.
- Keep text readable on small phones.
- Keep the primary action for a visit reachable without excessive scrolling.

Do not use web-only concepts such as DOM elements, CSS files, hover-only affordances, browser storage APIs, or desktop table interactions.

## Architecture Expectations

Use a structure that makes responsibilities clear. One acceptable shape:

```text
src/
  features/
    providerWorkboard/
      components/
      data/
      domain/
      native/
      screens/
      viewModels/
      analytics.ts
      types.ts
```

We care less about exact folder names than about boundaries:

- UI components render state and call callbacks.
- View models or hooks coordinate state and async behavior.
- Domain modules contain pure business logic.
- Mock resources imitate API boundaries.
- Native modules wrap camera, scanner, sensors, location, haptics, and persistence concerns.
- Analytics is centralized enough that event names stay consistent.

Avoid a single giant screen file.

## Agent Workflow Requirement

Include an `AGENT_LOG.md` with your submission.

It should answer:

- Which coding agents or AI tools did you use?
- What tasks did you delegate?
- What prompts or instructions were most effective?
- Which generated outputs did you reject or rewrite?
- What bugs did your review catch?
- What parts did you implement manually?
- What tradeoffs did you make to stay within the timebox?
- What would you ask an agent to do next if you had another hour?

This is required. A polished codebase with no agent workflow notes is incomplete.

## Deliverables

Submit a PR, repository, or patch containing:

- React Native implementation.
- Mock data and mocked async resource layer.
- Native feature flows for camera capture, scanning, motion checking, and selected metadata capture.
- Pure domain logic.
- Analytics abstraction and call sites.
- Tests for core logic.
- `AGENT_LOG.md`.
- A short README section or PR description with:
  - How to run the app.
  - How to run tests.
  - Validation commands you ran.
  - Known gaps.
  - Screenshots or simulator recording if practical.

## Validation

Run the relevant commands for your setup. For example:

```bash
pnpm typecheck
pnpm test
pnpm lint
pnpm start
```

If a command fails, document:

- The exact command.
- The failure.
- Whether you believe it is caused by your change.
- What you would do next.

## Evaluation Rubric

| Area | Strong submission |
|---|---|
| Product judgment | The workflow helps a provider make decisions quickly in the field. Important states are visible without clutter. |
| Native capability execution | Camera, scanner, accelerometer, permission, cleanup, fallback, and local persistence flows are handled deliberately. |
| React Native execution | Uses native primitives, virtualization, safe areas, accessibility props, responsive mobile layout, and clean interaction states. |
| State and async behavior | Pending, success, failure, retry/degraded behavior, and derived summaries stay consistent after actions. |
| Domain modeling | Status transitions, action eligibility, filtering, evidence readiness, scan results, motion checks, and summaries are explicit, typed, and tested. |
| Agent orchestration | Work is decomposed well, generated code is reviewed, and the final system is coherent rather than stitched together. |
| Code quality | Components are focused, names are clear, types are useful, and mock API boundaries can be replaced later. |
| Analytics | Event names and payloads are consistent, stable, and placed at meaningful user-action points. |
| Verification | Tests cover risky logic and validation notes are honest. |
| Polish | The app handles edge cases and feels usable, not just technically present. |

## Strong Signals

- You make a field workflow that is fast to scan and hard to misuse.
- You extract business rules before wiring UI around them.
- You treat permissions, sensors, and camera failure modes as core product states.
- You clean up sensor subscriptions and avoid battery-heavy background work.
- You provide a credible dev fallback without weakening the production flow.
- You keep generated code simple after review.
- You show multiple operational states without making the screen noisy.
- You preserve list state while moving through details and actions.
- You model action eligibility instead of hiding buttons with scattered conditionals.
- Your analytics payloads are consistent and boring.
- Your `AGENT_LOG.md` shows judgment, not theater.

## Weak Signals

- A large generated diff that you cannot explain.
- A desktop table translated directly to mobile.
- `ScrollView` plus `.map()` for the main list.
- UI-only implementation with no explicit domain logic.
- Action buttons that allow invalid state transitions.
- Camera or sensor code mixed directly into large UI components.
- Missing permission-denied states.
- Sensor subscriptions that stay active after leaving the screen.
- Completion allowed even when required proof, scan, or motion checks are missing.
- Missing loading, error, empty, pending, disabled, or accessibility states.
- Analytics events with inconsistent property names.
- Global modals that break nested presentation behavior.
- No evidence that you reviewed or constrained agent output.

## Optional Stretch

Do one only if the core work is already solid:

- Add optimistic updates with rollback.
- Add pagination with `onEndReached`.
- Add grouping by route, priority, or day.
- Add persisted filters.
- Add a compact map/list toggle using mocked coordinates.
- Add a compass/orientation hint while capturing evidence.
- Add image annotation for damage photos.
- Add background upload retry when the app returns online.
- Add haptic feedback for successful scan match and failed mismatch.
- Add a simulator recording showing the list, site sheet, visit sheet, and one action.

## Review Interview

In the follow-up interview, expect to walk through:

- Your agent workflow.
- One piece of generated code you changed significantly.
- Your domain model and status transition rules.
- A React Native platform issue you handled.
- Your permission and native-module boundaries.
- How you cleaned up sensor subscriptions.
- How you would test camera and accelerometer flows beyond pure unit tests.
- How you would wire this to real APIs.
- What you would simplify before merging.
- What you would ask an agent to improve next.
