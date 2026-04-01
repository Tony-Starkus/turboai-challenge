from django.conf import settings
from django.db import models


class Category(models.TextChoices):
    RANDOM_THOUGHTS = "Random Thoughts", "Random Thoughts"
    SCHOOL = "School", "School"
    PERSONAL = "Personal", "Personal"

    @classmethod
    def color_for(cls, value: str) -> str | None:
        """Return a hex color for the given category value or member.

        Accepts either the choice value (e.g. 'School') or the enum member.
        """
        # Normalize to the string value
        key = value.value if isinstance(value, cls) else value
        return _CATEGORY_COLOR_MAP.get(key)


class Note(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True, default="")
    category = models.CharField(max_length=30, choices=Category.choices)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notes")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_edited_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-last_edited_at", "-id"]


    def __str__(self):
        return self.title


# Module-level mapping so enum creation isn't confused by non-string keys.
_CATEGORY_COLOR_MAP = {
    Category.RANDOM_THOUGHTS.value: "#F97373",  # coral
    Category.SCHOOL.value: "#FBBF24",  # yellow
    Category.PERSONAL.value: "#34D399",  # sage/green
}
