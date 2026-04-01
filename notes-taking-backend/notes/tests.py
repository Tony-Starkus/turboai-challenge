from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Category, Note

User = get_user_model()


class NoteAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="owner@example.com",
            name="Owner",
            password="StrongPassword123!",
        )
        self.other_user = User.objects.create_user(
            email="other@example.com",
            name="Other User",
            password="StrongPassword123!",
        )
        self.own_note = Note.objects.create(
            user=self.user,
            title="My note",
            content="Private content",
            category=Category.PERSONAL,
        )
        self.other_note = Note.objects.create(
            user=self.other_user,
            title="Other note",
            content="Should not be visible",
            category=Category.SCHOOL,
        )
        self.client.force_authenticate(user=self.user)

    def test_list_returns_only_authenticated_user_notes(self):
        response = self.client.get("/api/notes/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], self.own_note.id)

    def test_create_always_assigns_authenticated_user(self):
        response = self.client.post(
            "/api/notes/",
            {
                "title": "Created by owner",
                "content": "Payload tries to spoof ownership",
                "category": Category.RANDOM_THOUGHTS,
                "user": self.other_user.id,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        created_note = Note.objects.get(id=response.data["id"])
        self.assertEqual(created_note.user, self.user)
        self.assertEqual(response.data["user"], self.user.id)

    def test_retrieve_denies_access_to_another_users_note(self):
        response = self.client.get(f"/api/notes/{self.other_note.id}/")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_denies_access_to_another_users_note(self):
        response = self.client.patch(
            f"/api/notes/{self.other_note.id}/",
            {"title": "Changed title"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.other_note.refresh_from_db()
        self.assertEqual(self.other_note.title, "Other note")

    def test_delete_denies_access_to_another_users_note(self):
        response = self.client.delete(f"/api/notes/{self.other_note.id}/")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Note.objects.filter(id=self.other_note.id).exists())
