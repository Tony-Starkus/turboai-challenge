from rest_framework import serializers
from .models import Note


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = (
            "id",
            "title",
            "content",
            "category",
            "user",
            "created_at",
            "last_edited_at",
        )
        read_only_fields = ("id", "user", "created_at", "last_edited_at")
