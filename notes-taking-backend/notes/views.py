from rest_framework import permissions, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Note, Category
from .permissions import IsNoteOwner
from .serializer import NoteSerializer


class NoteViewSet(viewsets.ModelViewSet):
    """
    Centralizes note CRUD in one resource-oriented viewset.

    We keep ownership rules here as well so list, create, retrieve, update,
    and delete all follow the same user-scoping behavior.
    """

    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated, IsNoteOwner]

    def get_queryset(self):
        return Note.objects.filter(user=self.request.user).order_by("-last_edited_at", "-id")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CategoriesView(APIView):
    """Returns available categories along with the count of notes for the
    requesting user and the configured color for each category.

    Response format:
    [
      {"key": "SCHOOL", "label": "School", "value": "School", "color": "#FBBF24", "count": 5},
      ...
    ]
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        results = []

        for member in Category:
            value = member.value
            label = member.label
            key = member.name
            color = Category.color_for(member)
            count = Note.objects.filter(user=request.user, category=value).count()

            results.append({
                "key": key,
                "label": label,
                "value": value,
                "color": color,
                "count": count,
            })

        return Response(results)
