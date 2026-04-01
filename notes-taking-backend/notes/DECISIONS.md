# Notes API Decisions

## 2026-03-31: `ModelViewSet` for note CRUD

We use a single `ModelViewSet` for notes because the resource has the standard
CRUD surface:

- `list`
- `create`
- `retrieve`
- `update` / `partial_update`
- `destroy`

Keeping those actions in one class makes the note API easier to maintain than
splitting the same ownership and serialization rules across multiple generic
views.

## Ownership and isolation by user

Each authenticated user manages only their own notes.

- `get_queryset()` filters notes by `request.user`, so list and object lookup
  are always scoped to the authenticated user.
- `perform_create()` ignores any incoming `user` field and always binds the new
  note to `request.user`.
- `IsNoteOwner` adds an explicit object-level permission so the ownership rule
  is visible in code and enforced on retrieve, update, and delete operations.

With this combination, one user cannot read, edit, or delete another user's
notes through the API.
