# Dripperz — Phase 3 showcase rebuild

## 1. Status and authority

**Status: accepted by the user, 2026-10-14.** This document consolidates accepted planning scope; it does not claim implementation or deployment. Section 7's unresolved decisions remain open.

The user authorized drafting this specification and then explicitly selected “Accept specification”. Acceptance does not authorize execution. Application implementation, branch preparation, staging, commits, pushes, PR creation, repository governance changes, provider provisioning and deployment remain separately authorized actions. An Accepted board card is direction approval, not permission to execute it.

This is the canonical product-specification location selected by the user. Requirements changes must be reflected here. Board cards track delivery and evidence; operational memory tracks verified state, not a second requirements backlog.

### Sources

- Product board: <https://github.com/users/benhammoush/projects/4>.
- Product direction: [Roadmap](https://github.com/users/benhammoush/projects/4/views/1).
- Execution entry point: [Delivery by outcome](https://github.com/users/benhammoush/projects/4/views/5).
- New source repository: <https://github.com/benhammoush/Dripperz>.
- Deployed visual reference: <https://dripperzcyberclub.netlify.app/>.
- Legacy reference only: `C:/Work/Drip/src/Phase_3.tsx`, `Phase_3_Mb.tsx` and related components/assets. Do not copy private material or generated builds into the new source repository.
- Accepted board scope inspected on 2026-10-14: three Outcome cards, PR 1–8 delivery cards and two Setup cards; all Accepted / Planned. No Horizon commitment or actual PR links were recorded.
- User decisions on 2026-10-14: repository-local specification, initial application version `0.1.0`, and separately authorized README-only `main` bootstrap before PR 1.

Legacy code and the live site are reference material, not authority to retain obsolete integrations, security mechanisms or content claims. Conflicts with this specification's exclusions must be surfaced rather than silently copied.

## 2. What we will deliver

A responsive showcase that preserves Dripperz Phase 3's cyberpunk identity and interactive character without wallet, minting or blockchain-data integrations.

| Outcome                              | Visitor or maintainer value                                                                 | Supporting planned delivery         |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ----------------------------------- |
| Faithful Phase 3 across devices      | Recognizable visuals, artwork, navigation and content on desktop and mobile                 | PRs 3–5                             |
| Interactive showcase without Web3    | Local rarity exploration, decorative terminal, opt-in radio and clearly historical treasury | PRs 6–7                             |
| Maintainable and verifiable delivery | Documented source, automated checks, reviewable changes and traceable, recoverable releases | PRs 1–2 and 8; separate setup tasks |

No new business promises, launch dates, adoption targets or Now/Next/Later priorities are introduced by this specification.

## 3. Product requirements

### 3.1 Visual identity and responsive shell

- Preserve the black/cyan palette, Goldman font, borders, Matrix/glitch effects, marquees and Phase 3 layout identity.
- Capture representative desktop/mobile references and extract visual tokens before reconstructing the visual shell.
- Preserve intentional desktop/mobile differences without duplicating entire pages.
- Provide responsive navigation with correct section targets, keyboard operation and visible focus behavior.
- Respect reduced-motion preferences. Animations must use lifecycle cleanup and visibility-aware behavior rather than unmanaged timers or global scroll handlers.
- Verify representative desktop/mobile visual fidelity against approved reference captures. Exact viewport and comparison criteria remain unresolved in section 7.

### 3.2 Core showcase

- Rebuild collection artwork, synchronized image/description galleries, cybermap timeline, FAQ and footer in the reference section order and styling.
- Keep content and approved public links in shared configuration rather than divergent desktop/mobile copies.
- Support gallery keyboard controls and autoplay pause; keep image and description selection synchronized.
- Verify navigation, galleries, FAQ and public links at mobile, tablet and desktop sizes.
- Clearly distinguish historical milestones from current commitments. Do not invent new promises or publish sensitive legacy material.

### 3.3 3D hero

- Preserve the animated Wattson hero using React Three Fiber/Drei after asset inventory and publication-rights review.
- Candidate reference assets are `Wattson_Animated.glb` and `clean5.hdr`; their presence in legacy sources is not publication permission.
- Match the approved reference model, environment and animation.
- Lazy-load the hero, use adaptive pixel ratio and control rendering work when offscreen or hidden.
- Provide loading/error UI, a static poster and an unsupported-WebGL fallback. The page must remain usable without the model.
- Verify reduced-motion behavior, desktop/mobile fidelity, asset loading and error/no-WebGL paths.
- Measure asset/rendering cost before making performance claims. Numerical budgets are not yet specified.

### 3.4 Local rarity explorer

- Use validated local legacy data for token lookup, attributes, rank, score display and trait-image composition.
- Document and validate the legacy rank/score/formatting/layer-order rules before rewriting them. This specification defines no replacement formulas, thresholds, units or rounding.
- Known token IDs must reproduce approved reference attributes, rank, score formatting and composition.
- Provide safe invalid-ID, missing-data and loading states; support lazy loading, keyboard use and mobile layouts.
- Do not request OpenSea APIs, RPC, ownership or pricing data. Network verification must confirm the absence of blockchain/marketplace data requests.
- Dataset provenance, exact rules, token-ID bounds and regression fixtures remain unresolved; ambiguity blocks calculation implementation.

### 3.5 Showcase extras

- Provide a decorative terminal with audited public commands and document links, without the legacy password gate or secrets.
- Audio must be off by default and activated by the visitor. Provide explicit play/pause and unavailable-stream handling; stream failures must not break the rest of the showcase.
- Present treasury information as static, dated historical content with approved sources, visibly distinguished from current balances.
- Do not query live Safe, Snapshot or RPC services, or fabricate treasury figures when sources are unavailable.
- Verify commands, links, keyboard/mobile behavior and absence of blockchain requests.
- Command inventory, public documents, stream availability and historical treasury content require audit/approval before implementation.

### 3.6 Release-wide acceptance

- Complete visual/browser regression, accessibility checks, content/link/public-asset audit and a no-Web3 network audit.
- Measure performance and document refinements without claiming unmeasured improvements.
- Review metadata, social preview and non-production indexing behavior. Exact metadata and indexing policy remain unresolved.
- Identify the accepted release candidate by exact source revision, application version and deployment identity.
- Require the user's staging walkthrough and verified recovery identity before production readiness. Production action requires separate approval.

## 4. Scope boundaries

### Included technical direction

- React + Vite + strict TypeScript, with a compatible pinned toolchain and lockfile.
- New maintainable source rather than wholesale migration of legacy implementation.
- Unit and browser-test harnesses, lint/format/type checks, production-build CI, version alignment and Dependabot for package dependencies and GitHub Actions.
- Useful English TSDoc-compatible docblocks for TypeScript and JSDoc for JavaScript from the first handwritten code.
- Separate intended Vercel dev, staging and production projects. Their names, suitability, configuration and operational readiness are not verified by this specification.

### Excluded

- Wallet connections, minting, sales, blockchain/marketplace data integrations and live ownership/pricing/balance claims.
- Legacy passwords, secrets, private DCC material and generated builds.
- Unapproved publication of legacy assets or documents.
- Changes to the existing Netlify deployment, domain migration or its removal.
- Automatic merging, ungated production-on-push or any implication that merged YAML proves an operational environment.

## 5. Engineering and delivery acceptance

### 5.1 Source foundation

- Reproducible installation and relevant lint, format, type, unit/browser and build checks must pass for the milestone's scope.
- Documentation checks must cover modules, classes, public contracts and substantial named functions, including internal helpers, hooks/components, scripts and test helpers. Trivial callbacks and declarative test cases need not each have a docblock.
- Documentation must explain purpose and meaningful parameters, results, errors, side effects and assumptions without duplicating TypeScript signature types. Complex decisions and failure handling need useful inline explanations.
- Configure maintained, compatible documentation-presence/structure checks plus TSDoc syntax validation. Syntax validation alone is insufficient.
- Documentation violations must be blocking local-lint/CI errors from PR 1. Do not use warning-only adoption, a changed-files baseline or blanket suppressions.
- Explicitly exclude generated code/build artifacts, not difficult handwritten code. Document conventions and exclusions in contribution guidance.
- Rule tests must prove missing/malformed documentation fails, valid documentation passes, substantive named arrow functions/hooks/components are covered and generated artifacts are excluded.
- Read-only review must also inspect comment usefulness and accuracy; lint cannot establish those qualities.
- Initial application version is `0.1.0`, aligned across package metadata and runtime reporting. This specification-only change does not create an application or bump a version.

#### Selected PR 1 toolchain — 2026-10-14

The user selected the following candidate stack after documentation and published npm engine/peer inspection. Selection is not proof of installation, runtime compatibility or enforcement. Use exact direct-dependency pins and a committed `package-lock.json`; CI must use reproducible installs. Revalidate package metadata when implementation begins and surface incompatibilities before changing the selected plan.

| Area                        | Selected versions                                                                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime and package manager | Node `24.21.0`; npm `11.19.0`                                                                                                               |
| UI                          | `react` and `react-dom` `19.3.0`                                                                                                            |
| Build                       | `vite` `8.3.4`; `@vitejs/plugin-react` `6.1.2`                                                                                              |
| Type checking               | `typescript` `6.0.3`, strict mode                                                                                                           |
| Type declarations           | `@types/node` `24.19.2`; `@types/react` and `@types/react-dom` `19.3.0`                                                                     |
| Unit/component tests        | `vitest` `5.0.4`; `jsdom` `30.1.2`; `@testing-library/react` `16.3.3`; `@testing-library/dom` `10.4.2`; `@testing-library/jest-dom` `7.0.1` |
| Browser tests               | `@playwright/test` `1.64.1`; Chromium, Firefox and WebKit projects                                                                          |
| Lint                        | `eslint` `10.12.0`; `typescript-eslint` `8.71.2`; `eslint-plugin-react-hooks` `7.1.1`; `eslint-plugin-react-refresh` `0.5.7`                |
| Documentation lint          | `eslint-plugin-jsdoc` `65.3.4` for presence/structure; `eslint-plugin-tsdoc` `0.5.4` for TypeScript documentation syntax; both blocking     |
| Formatting                  | `prettier` `3.9.10`                                                                                                                         |

- Keep TypeScript on the selected `6.0.3`: inspected `typescript-eslint` `8.71.2` declares TypeScript `>=4.8.4 <6.1.0`. Do not automatically adopt the inspected latest TypeScript `7.0.2` or add a dual-TypeScript setup.
- Use ESLint flat configuration with TypeScript-aware rules and documentation contexts that cover named arrow functions, hooks/components and the other handwritten surfaces required above. Test plugin behavior on the selected ESLint version; declared peer support alone is not sufficient.
- Keep TypeScript types in signatures, not duplicated in docblocks. Verify JSDoc structure rules and TSDoc syntax rules work together on valid comments.
- A blocking version-alignment check must compare package metadata with the exported runtime application version (`0.1.0` initially). No runtime-version module exists yet.
- The selected browser harness must cover Chromium, Firefox and WebKit; its results do not replace user localhost acceptance.
- Additional direct support dependencies, if needed, require compatible exact pins and lockfile review during PR 1. No packages or browser binaries were installed during selection.

#### Approved PR 1 compatibility adjustment — 2026-10-14

Execution exposed incompatible declaration merging between `@testing-library/jest-dom` `7.0.1`'s `/vitest` entry (one assertion generic) and Vitest `5.0.4` (return and received generics). The user selected a small local adapter rather than changing the selected pins or suppressing dependency type checks. Register the standalone jest-dom matchers with `expect.extend`, and augment the documented Vitest 5 `Matchers<R, T>` interface for the DOM assertions used by the tests. Retain strict checking without `skipLibCheck`; document the adapter and remove it after an upstream-compatible integration is verified.

Compatible direct support pins added for the ESLint configuration: `@eslint/js` `10.0.1` and `globals` `17.13.0`. Published engine/peer metadata was revalidated during PR 1; execution/check results are separate evidence, not guaranteed by declared compatibility.

Evidence: local `node --version` and `npm --version`; published npm registry metadata inspected on 2026-10-14; current [Vite documentation](https://vite.dev/guide/), [Vitest documentation](https://vitest.dev/guide/), [typescript-eslint compatibility guidance](https://typescript-eslint.io/users/dependency-versions/), [JSDoc plugin documentation](https://github.com/gajus/eslint-plugin-jsdoc), [TSDoc plugin documentation](https://github.com/microsoft/tsdoc/tree/main/eslint-plugin) and [Playwright documentation](https://playwright.dev/docs/intro). These are selection evidence, not an executed installation/test result.

### 5.2 Git governance and review checkpoints

- Agreed bootstrap plan: with separate authorization, publish a minimal README-only initial commit on `main`; then implement PR 1 on a short-lived branch through ordinary PR review.
- Use protected `main` and short-lived milestone branches rather than environment branches. Agree and read back the actual governance policy after the base branch and required CI check names exist.
- Review requirements, required checks, stale-approval/up-to-date behavior, administrator/bypass enforcement and force-push/deletion restrictions need explicit policy decisions and enforcement evidence.
- For each substantive implementation milestone: run relevant checks, obtain read-only review, resolve blocking findings and obtain user localhost acceptance or an explicit skip before publication.
- Reach PR-ready only after applicable checks/review/manual acceptance. Stop at that milestone; publication does not authorize starting the next one.

### 5.3 Environment and release foundations

- Intended targets are isolated Vercel dev/staging/production projects; proposed names on the setup card are `dripperz-dev`, `dripperz-staging` and `dripperz-production`, subject to availability and approval.
- Verify account/plan capability and explicitly agree triggers/access before provisioning. PR 2 defines the delivery contract; provisioning, secret configuration and deployments are separately authorized operational work.
- Use exact reviewed source revisions, least-privilege secret references without values, per-target concurrency and fail-closed handling for missing configuration, credentials or verification.
- Record each target independently as not configured, partially configured, configured but unverified, or operationally verified with dated evidence. Inspect actual branch protection separately from CI results.
- Promote reviewed revisions through dev, staging and production with applicable deployed smoke checks. No ungated production-on-push.
- Record revision/version/deployment identity and the prior immutable recovery identity. Validate promotion/rollback runbooks and verify behavior/version after rollback; rollback is not permission to alter persistent data.
- Missing governance or environment evidence blocks applicable merge/release/promotion readiness, not necessarily bounded local drafting or implementation.

## 6. Planned delivery units and dependencies

These are board delivery cards, not existing pull requests or authorization to execute them. No dates or Horizon assignments are implied.

| Unit                        | Included scope                                                                                                                       | Prerequisites and stopping boundary                                                                                                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PR 1 — Source foundation    | Scaffold, compatible pinned tooling, checks/test harnesses, build CI, Dependabot, documentation enforcement, README and initial spec | Scope/spec agreement; bootstrap plan resolved before Git mutation. Stop at PR-ready; no visual feature work, provisioning or deployment.                                              |
| PR 2 — Delivery foundation  | Workflow/configuration validation, exact-revision delivery identity, concurrency, smoke checks and promotion/rollback guidance       | PR 1 merged; account/plan capability and trigger/access policy agreed. No provisioning, secret changes or deployment.                                                                 |
| PR 3 — Visual shell         | References/tokens, font/palette, responsive layout/navigation and controlled effects                                                 | PRs 1–2 merged unless a dependency change or stacked workflow is explicitly accepted. Stop at PR-ready.                                                                               |
| PR 4 — Core showcase        | Artwork, synchronized galleries, cybermap, FAQ, footer and approved public links                                                     | PR 3 merged. No 3D, rarity or extras. Stop at PR-ready.                                                                                                                               |
| PR 5 — 3D hero              | Approved assets, model/environment/animation, resilient loading/fallbacks and measured rendering baseline                            | PR 4 merged; reference and asset rights approved. Stop at PR-ready.                                                                                                                   |
| PR 6 — Rarity explorer      | Validated local data/rules, lookup/traits/composition and deterministic fixtures                                                     | PR 5 merged under the accepted sequential roadmap; calculation rules documented before rewriting. Stop at PR-ready.                                                                   |
| PR 7 — Showcase extras      | Public terminal/documents, opt-in radio and approved historical treasury                                                             | PR 6 merged; sources, documents and stream verified. Stop at PR-ready.                                                                                                                |
| PR 8 — Release readiness    | Full regression/audits, metadata/indexing, measured refinements and release/recovery records                                         | PRs 1–7 merged/accepted; governance/environment readiness and content gaps resolved. Stop at PR-ready; staging deployment/acceptance is separately authorized; no production cutover. |
| Setup — GitHub governance   | Agreed ruleset and actual enforcement readback; board views are already configured                                                   | Base branch and PR 1's actual required check names; separate remote-setup authorization.                                                                                              |
| Setup — Vercel provisioning | Approved isolated targets, configuration ownership and gated trigger/access policy                                                   | PR 2 contract and explicit account/setup authorization. Operational deployment/browser/rollback verification remains separate.                                                        |

## 7. Unresolved decisions and evidence gaps

Do not silently choose defaults or claim these items are verified. Resolve each before its dependent implementation or release checkpoint; later feature gaps do not automatically block a foundation-only scaffold.

| Gap                              | Required decision or evidence                                                                                                                                                                | Dependent checkpoint                                 |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Toolchain execution verification | Stack and version-check contract selected in section 5.1; verify reproducible install, actual plugin/parser behavior, documentation-rule fixtures, type checks, unit/browser tests and build | PR 1                                                 |
| Git governance                   | Approved review/check/up-to-date/bypass policy and actual enforcement readback                                                                                                               | Governance setup; applicable merge/release readiness |
| Hosting topology details         | Vercel plan suitability, final project names, access, configuration owners, exact-source triggers and approval gates                                                                         | PR 2 contract and separate provisioning              |
| Visual acceptance                | Reference captures, viewport set and agreed comparison criteria                                                                                                                              | PRs 3–5; release regression                          |
| Assets and public content        | Inventory, publication rights, public links and historical-vs-current content approval                                                                                                       | Relevant PRs 3–7; release audit                      |
| Rarity rules                     | Dataset provenance, ID bounds, exact scoring/ranking/formatting/layer rules and known-ID fixtures                                                                                            | PR 6                                                 |
| Extras                           | Public command/document inventory, verified stream and sourced/dated treasury content                                                                                                        | PR 7                                                 |
| Release acceptance details       | Browser/accessibility acceptance criteria, measured performance baseline/budgets, metadata/social preview and indexing policy                                                                | PR 8                                                 |
| Operational readiness            | Dated branch-policy evidence plus each target's deployment, browser smoke, revision/version identity and recovery evidence                                                                   | Applicable release/promotion checkpoint              |

No application code, CI enforcement, usable environments, production acceptance or recovery capability is established merely by writing or accepting this document.
