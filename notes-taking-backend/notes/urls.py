from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import NoteViewSet, CategoryView

app_name = "notes"

router = DefaultRouter()
router.register("", NoteViewSet, basename="notes")

# Ensure the explicit categories route is checked before the router's detail route
urlpatterns = [
	path("categories/", CategoryView.as_view(), name="categories"),
] + router.urls
