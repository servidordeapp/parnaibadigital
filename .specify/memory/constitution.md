<!--
Sync Impact Report
==================
Version change: [TEMPLATE] → 1.0.0
Bump rationale: Initial ratification. Template placeholders replaced with concrete
principles; no prior versioned constitution existed.

Modified principles:
  - [PRINCIPLE_1_NAME] → I. Code Quality Is Non-Negotiable
  - [PRINCIPLE_2_NAME] → II. Test-First Discipline (NON-NEGOTIABLE)
  - [PRINCIPLE_3_NAME] → III. User Experience Consistency
  - [PRINCIPLE_4_NAME] → IV. Performance Is a Requirement, Not a Goal
  - [PRINCIPLE_5_NAME] → (removed; user scoped constitution to four principles)

Added sections:
  - Quality Gates (replaces [SECTION_2_NAME])
  - Development Workflow (replaces [SECTION_3_NAME])

Removed sections:
  - Fifth principle slot from template

Templates requiring updates:
  - ✅ .specify/templates/plan-template.md — Constitution Check gate is
    principle-agnostic ("[Gates determined based on constitution file]");
    Technical Context already captures Performance Goals + Constraints (Principle IV).
  - ✅ .specify/templates/spec-template.md — Success Criteria section supports
    measurable performance and UX outcomes required by Principles III and IV.
  - ✅ .specify/templates/tasks-template.md — test-task guidance marks tests
    OPTIONAL; Principle II overrides this per-project. See follow-up TODO.
  - ✅ .specify/templates/checklist-template.md — no constitution references.
  - ⚠ README.md — placeholder content only; no principle references to update yet.

Follow-up TODOs:
  - TODO(TASKS_TEMPLATE_TESTS): tasks-template.md line 12 states "Tests are
    OPTIONAL - only include them if explicitly requested". Principle II makes tests
    mandatory for this project. Template left unmodified because it is upstream
    Spec Kit tooling; /speckit-tasks MUST emit test tasks regardless of that note.
-->

# parnaibadigital Constitution

## Core Principles

### I. Code Quality Is Non-Negotiable

Every merged change MUST satisfy all of the following:

- Automated linting and formatting pass with zero errors; formatting is tool-enforced,
  never hand-argued in review.
- Static type checks pass where the language supports them. Type-suppression comments
  (`any`, `# type: ignore`, `@ts-expect-error`, casts) MUST carry an inline reason.
- No function exceeds one clear responsibility. Cyclomatic complexity above 10 MUST be
  refactored or justified in the PR description.
- Public functions, modules, and exported types carry doc comments stating purpose,
  inputs, and failure modes.
- Dead code, commented-out code, and unused dependencies are deleted, not archived.
- Duplication is removed on third occurrence (rule of three); premature abstraction of
  a second occurrence is equally a violation.

**Rationale**: Quality defects compound. Enforcing at merge time is cheaper by orders of
magnitude than remediating in a codebase that has normalized the defect.

### II. Test-First Discipline (NON-NEGOTIABLE)

- Tests are written before implementation. The cycle is: write test → observe it FAIL →
  implement → observe it PASS → refactor.
- Every user story from `spec.md` MUST have at least one integration test that exercises
  the story end-to-end and can be run in isolation.
- Every bug fix MUST begin with a regression test that reproduces the bug.
- Contract tests are mandatory for: new API endpoints, changes to existing contracts,
  inter-service messages, and shared schemas.
- Line coverage MUST be ≥ 80% on changed files; coverage MUST NOT decrease on any
  branch merged to `main`.
- Tests MUST be deterministic. No sleeps for synchronization, no dependence on wall-clock
  time, ordering, or network access to third parties. A flaky test is a failing test and
  MUST be fixed or deleted within one working day of detection — never re-run until green.

**Rationale**: Tests written after the fact validate what the code does, not what it was
supposed to do. Writing them first is the only reliable way to keep the specification
and the implementation honest about each other.

### III. User Experience Consistency

- All user-facing surfaces MUST draw from a single shared source of design tokens
  (color, spacing, typography, motion) and shared components. One-off styling in a
  feature module is a violation.
- Interaction patterns MUST be consistent across the product: identical semantics for
  navigation, form submission, destructive-action confirmation, empty states, loading
  states, and error states.
- Every asynchronous operation MUST render an explicit loading state, an explicit empty
  state, and an explicit error state. Silent failure is prohibited.
- Error messages MUST state what happened and what the user can do next, in the user's
  language, without exposing stack traces, internal identifiers, or raw error codes.
- Accessibility floor is WCAG 2.1 Level AA: keyboard reachability for every interactive
  element, visible focus indicators, ≥ 4.5:1 text contrast, and accessible names on
  controls. Automated a11y checks run in CI.
- Copy follows one voice and one terminology set — the same concept keeps the same name
  everywhere it appears.

**Rationale**: Users build one mental model of a product. Every inconsistency forces them
to rebuild it, which is experienced as the product being unreliable rather than merely
different.

### IV. Performance Is a Requirement, Not a Goal

- Every feature declares explicit performance budgets in its `plan.md` before
  implementation begins. Absent budgets, the defaults below bind:
  - API responses: p95 < 200 ms, p99 < 500 ms, measured server-side excluding network.
  - UI interaction feedback: < 100 ms; any operation exceeding 1 s shows progress.
  - Initial page load: Largest Contentful Paint < 2.5 s, Interaction to Next Paint
    < 200 ms, Cumulative Layout Shift < 0.1 on a mid-tier device over 4G.
  - Batch and background jobs: documented throughput target with an alert threshold.
- Performance budgets are enforced in CI. A build that exceeds a budget fails; it is not
  merged with a follow-up ticket.
- Database access MUST avoid N+1 query patterns. Any query path expected to scale with
  data volume MUST be index-backed, and that expectation MUST be verified, not assumed.
- Payload growth is bounded: client bundle size regressions above 5% require explicit
  justification in the PR.
- Optimization MUST be preceded by measurement. Claims of a performance improvement
  require before/after numbers from the same environment.

**Rationale**: Performance regressions arrive one acceptable increment at a time. Budgets
convert a slow slide into a discrete, reviewable event.

## Quality Gates

The following gates block merge to `main`. None may be waived by the author alone.

| Gate | Requirement | Enforced by |
|------|-------------|-------------|
| Lint & format | Zero errors | CI |
| Type check | Zero errors | CI |
| Unit + integration tests | All pass | CI |
| Coverage | ≥ 80% on changed files, no decrease | CI |
| Accessibility | Zero automated WCAG 2.1 AA violations | CI |
| Performance budgets | Within declared or default budgets | CI |
| Peer review | At least one approving review from a non-author | Branch protection |

A gate may be bypassed only for an incident hotfix, and only when the bypass, its
reason, and a remediation task are recorded in the PR description. Remediation is due
within the next working day.

## Development Workflow

- Work proceeds spec → plan → tasks → implement. Implementation does not begin before a
  written spec and plan exist for the feature.
- Each feature is developed on its own branch named `###-feature-name`. Direct commits to
  `main` are prohibited.
- Commits are scoped to one logical change and carry a message explaining *why*, not
  restating the diff.
- Every plan passes a Constitution Check before Phase 0 research and again after Phase 1
  design. Violations are either fixed or recorded in the plan's Complexity Tracking table
  with a justification and the rejected simpler alternative.
- Reviewers verify constitutional compliance explicitly, not just functional correctness.
  A review that approves a principle violation shares responsibility for it.
- Dependencies added MUST be justified: what it does, why it is not written in-house, and
  its maintenance and security posture.

## Governance

This constitution supersedes all other development practices, conventions, and habits.
Where a team convention conflicts with a principle here, this document wins.

**Amendment procedure**: Amendments are proposed as a pull request modifying this file.
The PR MUST state the rationale, the version bump and its justification, and a migration
plan for any existing code the amendment renders non-compliant. Approval requires review
by the project maintainer.

**Versioning policy**: This document uses semantic versioning.

- **MAJOR**: A principle is removed or redefined in a backward-incompatible way, or
  governance rules change such that previously compliant work becomes non-compliant.
- **MINOR**: A principle or section is added, or existing guidance is materially expanded.
- **PATCH**: Clarifications, wording, and typo fixes that do not change obligations.

**Compliance review**: All PRs verify compliance against these principles. Complexity that
violates a principle MUST be justified in writing at the point of introduction; unjustified
complexity is grounds for rejection regardless of functional correctness. Constitution
adherence is reviewed at each feature completion, and the constitution itself is reviewed
for fitness quarterly.

**Runtime guidance**: Agent- and tool-specific development guidance lives in the repository
guidance files (e.g. `CLAUDE.md`) and in `.specify/templates/`. Those files implement this
constitution; they do not amend it.

**Version**: 1.0.0 | **Ratified**: 2026-08-11 | **Last Amended**: 2026-08-11
