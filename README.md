# PAIR Task 2.2 Demo Mockup

This repository will host a semi-working web mockup for the PAIR platform's **Section 5.2 / Task 2.2**:

- PPT recommendation system for transportation datasets and ITS applications
- Stakeholder-facing web interface for exploring candidate privacy-preserving techniques
- Preference-based and tradeoff-based recommendation flows for agencies and data-sharing sites

The mockup is intended for demos, not production use. Authentication, dataset onboarding, benchmark scores, recommendations, and visualizations may all be backed by static mock data.

## Demo Scope

The planned user flow is:

1. Stakeholder login
2. Dataset/application onboarding
3. Metric preference selection
4. Candidate PPT recommendation
5. Tradeoff exploration and supporting data visualization

The primary persona is an agency or transportation data-sharing stakeholder evaluating how to share ITS data while preserving privacy.

## Product Framing

This mockup is based on:

- `PDaSP Report-v6.pptx`
- `PDaSP Transportation Privacy.pdf`
- `Section 5.2`: `Task 2.2: PPT Recommendation System and Web Interface Development`

The UI should reflect the Section 5.2 recommendation dimensions:

- User-level privacy
- Site-level privacy
- Utility
- Efficiency
- Privacy auditability
- Privacy policy compliance

The recommendation workflow should explicitly support two modes described in the PDF:

- Weighted-sum recommendation when the site specifies metric priorities
- Pareto-based tradeoff exploration when the site wants best nondominated options without setting priorities

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
- Dataset and ITS application onboarding flow
- Preference controls for weighted recommendation
- Recommendation page with ranked candidate PPTs
- Tradeoff view for Pareto-optimal techniques
- Visualization page with mock traffic charts and metric comparisons

## Notes

- This repo currently starts from the presentation only; the app will be built from scratch.
- The demo should optimize for stakeholder clarity and credibility rather than backend completeness.
- Any recommendation logic in v1 should be transparent and explainable, not presented as a validated scientific system.
- The focus is the stakeholder-facing recommendation experience, not the full benchmark repository or cyberinfrastructure.
