# Issue tracker: GitHub

Issues and specs for this repo live as GitHub issues on `thibka/vision`. Use the `gh` CLI for all operations (the repo is inferred from `git remote`).

Tickets that predate this switch are archived as markdown under `.scratch/`. They are read-only history: do not add to them.

## Conventions

- A **spec** is an issue labelled `spec`, titled after the feature. Its body is the spec.
- An **implementation issue** is one issue per ticket, never a single combined tickets issue. Its body starts with `Parent: #<spec>` and, when it has blockers, a `Blocked by: #N, #N` line (kept in sync with the native links below).
- Triage state is a label (see `triage-labels.md` for the role strings).
- Comments and conversation history go in the issue's comments.

## When a skill says "publish to the issue tracker"

```
gh issue create --title "<title>" --body-file <file> --label <label>
```

Pass the body through a file or heredoc to keep the markdown intact. The command prints the issue URL; its number is the ticket id.

## When a skill says "fetch the relevant ticket"

```
gh issue view <number> --comments
```

The user will normally pass the number or the URL.

## Blocking edges

Declare each edge as a native "blocked by" link, so a ticket is grabbable once its blockers are closed:

```
gh api repos/thibka/vision/issues/<blocked>/dependencies/blocked_by \
  -X POST -F issue_id=$(gh api repos/thibka/vision/issues/<blocker> --jq .id)
```

`issue_id` is the blocker's numeric id (`.id`), not its issue number. Also keep the `Blocked by:` line in the body so the edge stays readable without the API.

## Wayfinding operations

Used by `/wayfinder`. The **map** is an issue with one **child** issue per ticket.

- **Map**: an issue labelled `map`, titled `<effort>` (the Notes / Decisions-so-far / Fog body).
- **Child ticket**: an issue with `Parent: #<map>` in the body and the question as the body. A `type:<research|prototype|grilling|task>` label records the ticket type; the `claimed` label records that it is claimed. A resolved ticket is closed.
- **Blocking**: native "blocked by" links (see above). A ticket is unblocked when every blocker is closed.
- **Frontier**: `gh issue list --state open --search "Parent: #<map> in:body -label:claimed"`, then keep those with no open blocker; lowest number wins.
- **Claim**: `gh issue edit <n> --add-label claimed` before any work.
- **Resolve**: post the answer as a comment under an `## Answer` heading (`gh issue comment <n> --body-file <file>`), close the issue (`gh issue close <n>`), then edit the map's body to append a context pointer (gist + link) to its Decisions-so-far.
