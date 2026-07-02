# ADR-004 — Visual Platform Freeze

**Date:** 2 July 2026  
**Status:** ACCEPTED  
**Context:** Milestone 18.9 — Visual Platform Closure & Production Readiness

## Decision

The Forge Visual Platform is declared feature complete as of Milestone 18.9.

## Scope

The following systems are frozen:

| System | File | Status |
|--------|------|--------|
| VisualManager | `src/services/visual-manager.ts` | ✅ Frozen |
| PresentationModel | `src/components/ui/PresentationModel.ts` | ✅ Frozen |
| CardRenderer | `src/components/ui/CardRenderer.tsx` | ✅ Frozen |
| RichTooltip | `src/components/ui/RichTooltip.tsx` | ✅ Frozen |
| SkeletonLoader | `src/components/ui/SkeletonLoader.tsx` | ✅ Frozen |
| AssetImage | `src/components/ui/AssetImage.tsx` | ✅ Frozen (dumb component) |

## Permitted Changes

After this ADR, changes to frozen systems may only occur to:

1. **Fix defects** — Correct behaviour that does not match specification
2. **Support new content types** — Add new templates to CardRenderer (not redesign existing ones)
3. **Improve performance** — Optimize rendering, caching, or asset loading without changing the API

## Prohibited Changes

The following are prohibited without a new Architecture Decision Record:

1. **Architectural redesign** — Replacing VisualManager, PresentationModel, or CardRenderer with different systems
2. **Adding parallel systems** — Introducing a second rendering pipeline, tooltip system, or loading system
3. **Changing the asset resolution chain** — Bypassing VisualManager → AssetImage → Renderer

## Rationale

1. **Stability** — The Visual Platform has been validated across Milestones 17, 18, 18.5, and 18.75
2. **Consistency** — Duplicate visual systems have been consolidated
3. **Production readiness** — The platform is ready for release without further redesign
4. **Future work** — M19+ focuses on performance, packaging, and distribution, not visual architecture

## Consequences

- Future milestones consume the Visual Platform rather than modifying it
- New UI features use existing CardRenderer templates and PresentationModel
- New content types may require new CardRenderer templates (not new renderers)
- Performance improvements go through the existing VisualManager → AssetImage pipeline
- Any change to a frozen system requires ADR approval
