from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class AuthenticationAPITests(APITestCase):
    def setUp(self):
        self.user_password = "StrongPassword123!"
        self.user = User.objects.create_user(
            email="user@example.com",
            name="Test User",
            password=self.user_password,
        )

    def test_register_creates_user_and_returns_tokens(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "email": "new-user@example.com",
                "name": "New User",
                "password": "AnotherStrongPassword123!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["user"]["email"], "new-user@example.com")
        self.assertIn("access", response.data["tokens"])
        self.assertIn("refresh", response.data["tokens"])
        self.assertTrue(User.objects.filter(email="new-user@example.com").exists())

    def test_token_obtain_pair_uses_email_and_password(self):
        response = self.client.post(
            "/api/auth/token/",
            {
                "email": self.user.email,
                "password": self.user_password,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["user"]["email"], self.user.email)

    def test_me_endpoint_accepts_jwt_authentication(self):
        token_response = self.client.post(
            "/api/auth/token/",
            {
                "email": self.user.email,
                "password": self.user_password,
            },
            format="json",
        )

        access_token = token_response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

        response = self.client.get("/api/auth/me/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.user.email)

    def test_me_endpoint_accepts_session_authentication(self):
        logged_in = self.client.login(email=self.user.email, password=self.user_password)

        response = self.client.get("/api/auth/me/")

        self.assertTrue(logged_in)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.user.email)

