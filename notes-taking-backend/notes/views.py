from rest_framework import permissions, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count
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


class CategoryView(APIView):
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
       counts = (
           Note.objects
           .filter(user=request.user)
           .values("category")
           .annotate(count=Count("id"))
       )

       count_map = {
           item["category"]: item["count"] for item in counts
       }

       results = []

       for member in Category:
            results.append({
                "key": member.name,
                "label": member.label,
                "value": member.value,
                "color": Category.color_for(member),
                "count": count_map.get(member.value, 0),
            })

       return Response(results)
