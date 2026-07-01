from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()

class AuthTests(APITestCase):
    def setUp(self):
        self.register_url = reverse('auth_register')
        self.login_url = reverse('token_obtain_pair')
        self.refresh_url = reverse('token_refresh')
        self.profile_url = reverse('user_profile')
        
        self.user_data = {
            'email': 'test@example.com',
            'password': 'StrongPassword123!',
            'password_confirm': 'StrongPassword123!',
            'first_name': 'Test',
            'last_name': 'User',
            'country': 'Zimbabwe'
        }

    def test_user_registration(self):
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.get().email, 'test@example.com')

    def test_user_login(self):
        # First register
        self.client.post(self.register_url, self.user_data)
        
        # Then login
        response = self.client.post(self.login_url, {
            'email': self.user_data['email'],
            'password': self.user_data['password']
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_protected_profile_endpoint(self):
        # Create user
        self.client.post(self.register_url, self.user_data)
        login_res = self.client.post(self.login_url, {
            'email': self.user_data['email'],
            'password': self.user_data['password']
        })
        token = login_res.data['access']

        # Access without token
        res_unauth = self.client.get(self.profile_url)
        self.assertEqual(res_unauth.status_code, status.HTTP_401_UNAUTHORIZED)

        # Access with token
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        res_auth = self.client.get(self.profile_url)
        self.assertEqual(res_auth.status_code, status.HTTP_200_OK)
        self.assertEqual(res_auth.data['email'], self.user_data['email'])

    def test_password_validation(self):
        bad_data = self.user_data.copy()
        bad_data['password'] = 'weak'
        bad_data['password_confirm'] = 'weak'
        response = self.client.post(self.register_url, bad_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)
