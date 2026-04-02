# AGENTS.md

This file defines working conventions for agents contributing to this repository.

## Mission

Build a polished, demo-ready web mockup for the PAIR platform's **Thrust 2** workflow:

- stakeholder login
- dataset onboarding
- benchmark-backed PPT discovery
- PPT recommendation
- privacy-aware data visualization

The goal is a credible demonstration artifact, not a production platform.

## Source of Truth

The product direction comes from `PDaSP Report-v6.pptx` in the repository root.

Primary slides to align with:

- `Task 2.1`: Benchmark Repository for "PPTs + ITS Data/Applications"
- `Task 2.2`: PPT Recommendation System
- `Task 2.3`: Web Interface

Use the terminology from the deck:

- PAIR platform
- PPT = privacy-preserving technique
- user-level privacy
- site-level privacy
- utility
- efficiency
- privacy auditability
- privacy policy compliance

## Product Constraints

- Scope is limited to **Thrust 2**
- Mockup only; hardcoded data is acceptable
- Default persona is an agency or transportation data-sharing stakeholder
- Default dataset story is NGSIM-style traffic trajectory data
- Authentication can be fake/client-side
- Recommendations should be deterministic and explainable

Do not over-engineer backend infrastructure unless the current task explicitly requires it.

## Implementation Defaults

- Prefer `Vite + React`
- Prefer static-host-compatible architecture
- Target `Vercel` for deployment
- Keep the first version frontend-only unless there is a clear demo need for lightweight serverless behavior
- Use local mock services or static JSON/TS modules instead of introducing a real database

## UX Priorities

- The app should feel like a stakeholder-facing platform, not a generic admin template
- Emphasize tradeoffs between privacy, utility, efficiency, auditability, and compliance
- Keep the recommendation logic visible and understandable in the UI
- Use concise explanatory copy grounded in transportation privacy and data sharing
- Include charts or visual comparisons that communicate "raw vs privacy-preserved" outcomes

## Suggested App Sections

Agents should generally work toward this flow:

1. `Login`
2. `Data Onboarding`
3. `Dashboard`
4. `Recommendation`
5. `Visualization`

## Data Modeling Guidance

Prefer small, explicit frontend types such as:

- `User`
- `DatasetProfile`
- `StakeholderPreferences`
- `PPTTechnique`
- `RecommendationResult`
- `VisualizationSeries`

The recommendation engine should use weighted scoring or another transparent rule-based approach unless a task explicitly changes that direction.

## Delivery Standard

When implementing features:

- Keep behavior demoable end-to-end
- Favor believable mock data over empty placeholders
- Prefer clean, composable UI sections over speculative abstraction
- Ensure the app remains deployable as a static frontend unless otherwise required

If a future task adds backend behavior, preserve a clear separation between:

- mock/demo logic
- real integration points

## Non-Goals for v1

- production auth
- real encryption
- real dataset ingestion pipelines
- scientific validation of recommendation scores
- full Thrust 1, 3, or 4 implementation
