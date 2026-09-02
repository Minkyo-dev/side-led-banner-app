# AGENTS.md instructions for C:\dev\Led Banner

These AGENTS.md instructions replace all previously provided AGENTS.md instructions.

I am a solo mobile app/game and Microsoft Windows app developer.

## Priorities

- Prefer practical, concise, professional, production-ready solutions.
- Fix bugs and root causes first.
- Make the smallest safe change and preserve existing logic.
- Avoid unnecessary refactoring, full-file rewrites, beginner tutorials, and repeated summaries.

## Coding and Reporting

- Show the scoped diff first and use patch format when practical.
- Ignore a directory only after confirming that it contains generated dependencies, cache, or build output. Do not ignore source code or user-authored assets based only on its name.
- Do not present failed, non-working, or unmeasurable results as successful.
- Do not add silent substitution, test-only fallback, or fabricated success unless the user explicitly authorizes that product behavior.
- Compile, lint, test, commit, push, and deploy only when the user explicitly requests the action.
- When compilation is explicitly requested, inspect the complete output. Report `compile-ok` and essential verification results on success; report the cause and relevant output on failure.
- When the app version changes, update the App Version display under Settings in the same change.

## Fallback Policy

- Never implement fallback behavior.
- If there is a problem, state the problem as-is.
- If something does not work, state that it does not work.
- If something cannot be measured, state that it cannot be measured.

## Wrapping Boundaries

- Wrapping is allowed only once, at the interface or gateway boundary.
- Wrap external API calls only in a single `ApiClient` file.
- Business logic and internal code must call through plainly without additional wrapping layers.

## Mobile Skill Routing

- Apply `mobile-app-production` to relevant Expo/React Native and Flutter app or game implementation and review work.
- Apply `mobile-signing-bootstrap` when creating a mobile app, changing an application identifier, configuring or auditing signing, or performing a release build.
- When an ad SDK, AdMob App ID, ad Unit ID, or ad UI is present, use `mobile-app-production` as the single detailed advertising policy, even if the current request does not explicitly mention ads.
- Never commit signing private keys, passwords, properties, or credential files. Credential creation, revocation, reissue, rotation, or external upload requires explicit user authorization.

## Android Platform Requirements

- Every Android app and game project, existing or new, must target Android 16 (API level 36) or higher (`targetSdk >= 36`).
- Keep `compileSdk` at or above the effective `targetSdk`.
- Verify the effective Android build configuration before reporting compliance; do not infer compliance only from framework defaults or an unverified configuration file.
- Do not lower the target SDK, add a compatibility fallback, or report compliance when the toolchain cannot meet this requirement. Report the exact blocker instead.
- Hide the Android navigation bar.

## iOS Platform Requirements

- Place every major iOS screen below the Status Bar safe area.

## Mobile Advertising Request Policy

- Apply the following bounded load sequence to both banner and rewarded-video ads in every mobile app and game: make the initial request at app startup for startup placements, or immediately when a later screen-specific banner becomes visible; retry once after 3 seconds when it fails, and retry one final time after 6 seconds when the second request fails.
- Show `Ad Unavailable` only after all three requests fail. Do not display a terminal unavailable state between attempts.
- Stop automatically after the third failed request. Prevent duplicate callbacks, concurrent retry timers, render-triggered requests, and any further automatic retry loop.
- A user-initiated manual retry may start a new bounded three-request cycle only when the app explicitly provides that control.
