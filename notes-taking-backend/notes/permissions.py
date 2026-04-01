from rest_framework import permissions


class IsNoteOwner(permissions.BasePermission):
    """
    Explicit object-level guard for note ownership.

    The queryset is already scoped to the authenticated user, but this keeps
    the ownership rule visible and enforced for object actions as well.
    """

    def has_object_permission(self, request, view, obj):
        return request.user.is_authenticated and obj.user_id == request.user.id
