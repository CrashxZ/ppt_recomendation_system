# PAIR Thrust 2 Demo Mockup

This repository will host a semi-working web mockup for the PAIR platform's **Thrust 2**:

- Benchmark repository for privacy-preserving techniques (PPTs)
- PPT recommendation system for transportation datasets
- Stakeholder-facing web interface for exploring privacy-preserving data sharing options

The mockup is intended for demos, not production use. Authentication, data onboarding, benchmark scores, recommendations, and visualizations may all be backed by static mock data.

## Demo Scope

The planned user flow is:

1. Stakeholder login
2. Data onboarding
3. Dashboard showing applicable privacy-preserving techniques
4. PPT recommendation for the uploaded/onboarded dataset
5. Data visualization using mock transportation data, likely NGSIM-style vehicle trajectory data

The primary persona is an agency or transportation data-sharing stakeholder evaluating how to share ITS data while preserving privacy.

## Product Framing

This mockup is based on the `PDaSP Report-v6.pptx` deck in this repository, specifically:

- `Task 2.1`: benchmark repository for "PPTs + ITS Data/Applications"
- `Task 2.2`: PPT recommendation system
- `Task 2.3`: web interface

The UI should reflect the deck's tradeoff dimensions:

- User-level privacy
- Site-level privacy
- Utility
- Efficiency
- Privacy auditability
- Privacy policy compliance

## Technical Direction

Current implementation assumptions:

- Frontend-first mockup
- `Vite + React`
- Client-side routing
- Hardcoded stakeholder login
- Local mock data for datasets, benchmark scores, and recommendations
- Static hosting target: `Vercel` by default

This keeps the initial demo easy to host while leaving room to add lightweight API behavior later if needed.

## Initial Deliverables

- App shell and routing
- Login screen
- Dataset onboarding flow
- Dashboard with applicable PPT cards
- Recommendation page with ranked top techniques
- Visualization page with mock traffic charts

## Notes

- This repo currently starts from the presentation only; the app will be built from scratch.
- The demo should optimize for clarity and credibility rather than backend completeness.
- Any recommendation logic in v1 should be transparent and explainable, not presented as a validated scientific system.
