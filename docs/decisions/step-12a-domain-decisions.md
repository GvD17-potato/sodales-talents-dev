# Sodales Talents — Step 12A Domain Decisions

## Status

Human-approved.

## U-1 — Draft profile database representation

### Final decision

- `headline` is nullable.
- `bio` is nullable.
- `location` is nullable.
- `category_id` is nullable.
- Nullability is not conditional on profile status.
- `draft` and `hidden` profiles may be incomplete.
- `pending` and `approved` profiles must satisfy publication completeness.
- Draft-save validation is separate from publication-completeness validation so
  incomplete drafts can be saved.
- Submission and approval both re-check a valid headline, valid bio, valid
  location, an existing valid category, and at least one skill.
- A failed completeness transition leaves the profile status unchanged.
- Portfolio links remain optional.

### Reason

Null values truthfully represent information that has not yet been supplied.
Publication readiness is a domain/state-transition rule rather than a property
implied by database nullability or placeholder values.

### Source basis

- SDD §§4a and 8 require sign-up to create a `draft` profile automatically.
- SDD §§4b and 7 define the publication checklist and require submission and
  approval to re-check completeness server-side.
- SDD §6 specifies the profile fields but does not specify their nullability.
- The Neon contract §4c requires public slugs to be non-null and unique but does
  not require these four fields to be non-null.
- The nullable representation and separate draft-save validation are an
  approved Step 12A product/engineering decision.

### Engineering implications

- Draft creation must not use placeholder text or a placeholder category.
- Draft and hidden save paths must support incomplete publication data.
- Submission and approval require a distinct server-side completeness check.
- The system must not infer publication readiness solely from column
  nullability.
- Failed completeness validation must not partially change profile status.

### Acceptance-test implications

- Sign-up succeeds when the four nullable publication fields are absent.
- An incomplete draft can be saved and remains `draft`.
- An incomplete hidden profile can be saved and remains `hidden`.
- Incomplete submission and approval attempts fail without changing status.
- Domain actions cannot produce a `pending` or `approved` profile unless every
  publication requirement passes.
- A profile can pass completeness without any portfolio links.

## U-2 — Material edit definition

### Final decision

For an `approved` profile, the following changes are material:

- display name change
- headline change
- bio change
- location change
- category change
- slug change
- skill addition
- skill removal
- skill content/name change
- portfolio-link addition
- portfolio-link removal
- portfolio URL change
- portfolio label change

The following are non-material when they are the only change:

- skill reorder
- portfolio-link reorder

Additional rules:

- A normalized no-op save is not material.
- If a save contains both a non-material reorder and any material change, the
  entire save is material.
- An approved material save atomically saves the changes and transitions
  `approved -> pending`.
- Public SQL visibility disappears as part of that committed transition.
- Materiality applies only to `approved` profiles. Existing lifecycle rules for
  other statuses remain unchanged.

### Reason

Changes to the meaning, identity, discoverability, claims, or destination of
public profile content require moderation. Pure ordering of already-reviewed
content does not.

### Source basis

- SDD §§4b, 5.2, and 14 require material edits to an approved profile to move
  it to `pending` and remove it from public visibility.
- The SDD does not define which edits are material.
- The exhaustive classification, normalization rule, and mixed-change rule are
  an approved Step 12A product/engineering decision.

### Engineering implications

- Materiality must be determined by comparing normalized persisted content
  with normalized submitted content, not merely by receiving a Save action.
- A no-op must not trigger re-review.
- A pure reorder must not be mistaken for a content change because child rows
  were replaced or received different database identities.
- Saving material changes and changing status must occur in one transaction.
- Public queries continue to expose only `approved` profiles at the SQL layer.

### Acceptance-test implications

- Each listed material change independently moves `approved -> pending`.
- Each reorder-only change independently preserves `approved`.
- An unchanged or normalization-equivalent save preserves `approved`.
- A save combining a reorder with a material change moves the profile to
  `pending`.
- A material save cannot commit changed content while leaving the profile
  approved.
- After a material save commits, the profile is absent from public SQL results.

## U-3 — Hidden-profile editing

### Final decision

- Any normal save on a `hidden` profile keeps it `hidden`.
- Incomplete hidden-profile saves may be stored.
- No-op saves keep the profile `hidden`.
- Reorder-only saves keep the profile `hidden`.
- Material changes keep the profile `hidden`.
- Editing never automatically changes a hidden profile to `draft` or `pending`.
- Only the explicit **Resubmit for review** action may perform
  `hidden -> pending`.
- Resubmission re-checks publication completeness server-side.
- Failed resubmission leaves the profile `hidden` and returns validation or
  completeness errors without a partial transition.
- There is no `hidden -> draft` transition and no automatic
  `hidden -> pending` transition during profile save.

### Reason

The hidden status represents an administrator's moderation decision. Normal
editing must not silently remove that decision or submit unfinished work for
review.

### Source basis

- SDD §§3, 4b, and 5.4 define explicit resubmission from `hidden` to `pending`
  after editing.
- The SDD does not explicitly state the status between editing and
  resubmission.
- Retaining `hidden` during every normal save is an approved Step 12A
  product/engineering decision.

### Engineering implications

- The hidden-profile save path must never mutate profile status.
- The explicit resubmission action must verify the current status and all
  publication-completeness requirements server-side.
- Completeness validation and `hidden -> pending` must form one successful
  state transition.
- Hidden profiles remain excluded from every public profile query.
- No additional profile status is required.

### Acceptance-test implications

- Incomplete, no-op, reorder-only, and material hidden-profile saves all retain
  `hidden`.
- Hidden profiles remain unavailable through public SQL queries after editing.
- Incomplete resubmission fails and retains `hidden`.
- Complete explicit resubmission transitions `hidden -> pending`.
- A normal profile save cannot produce `hidden -> draft` or
  `hidden -> pending`.

## U-4 — Inquiry archive lifecycle

### Final decision

Allowed transitions:

- Mark read: `new -> read`
- Mark unread: `read -> new`
- Archive: `new -> archived`
- Archive: `read -> archived`
- Restore: `archived -> read`

Direct `archived -> new` is not allowed. To make a restored inquiry unread,
the required sequence is `archived -> read -> new`.

Do not add:

- previous-status storage
- archive history solely for restoration
- another inquiry status

The normal documented flow remains `new -> read -> archived`, while direct
`new -> archived` is also valid.

### Reason

Archiving is an independent triage action, so an administrator may archive a
new inquiry directly. Because the MVP stores only one status and does not
preserve the pre-archive state, restoration needs one deterministic destination.
Returning to `read` makes the inquiry active without incorrectly counting it as
brand-new or unreviewed.

### Source basis

- SDD §5.3 describes the normal `new -> read -> archived` workflow.
- SDD §4c presents read/unread and archive/restore as separate actions.
- SDD §6 defines only `new`, `read`, and `archived` inquiry statuses.
- Direct archive and deterministic restore behavior are an approved Step 12A
  product/engineering decision.

### Engineering implications

- Inquiry mutations must validate the current persisted status before applying
  a transition.
- Restore always produces `read`, regardless of the pre-archive status.
- No previous-status field, archive-history mechanism, or additional enum value
  is required for restoration.
- An administrator must restore an inquiry before marking it unread.

### Acceptance-test implications

- Both `new` and `read` inquiries can transition directly to `archived`.
- Restoring any archived inquiry produces `read`.
- Direct `archived -> new` is rejected.
- The two-step `archived -> read -> new` sequence succeeds.
- Restored inquiries do not enter the new-inquiry count unless subsequently
  marked unread.

## Remaining Domain Blockers

None from Step 12A.
