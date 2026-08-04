from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from django.contrib.auth.models import User
from tariffs.models import HSCode, TariffCategory
from .models import SavedCalculation

class AccountsAndCalculationsTests(APITestCase):
    def setUp(self):
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        self.calculations_url = reverse('calculation-list-create')
        
        self.category = TariffCategory.objects.create(name='Test', slug='test')
        self.hs_code = HSCode.objects.create(
            code='1234', name='Test Item', category=self.category,
            duty_rate='10', vat_applicable=True, is_duty_free=False
        )

        self.user1 = User.objects.create_user(username='user1@test.com', email='user1@test.com', password='password123!')
        self.user2 = User.objects.create_user(username='user2@test.com', email='user2@test.com', password='password123!')
        
    def test_registration(self):
        data = {
            'email': 'newuser@test.com',
            'password': 'StrongPassword123!',
            'password_confirm': 'StrongPassword123!'
        }
        res = self.client.post(self.register_url, data, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email='newuser@test.com').exists())

    def test_login(self):
        data = {
            'username': 'user1@test.com',
            'password': 'password123!'
        }
        res = self.client.post(self.login_url, data, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)

    def test_save_calculation(self):
        self.client.force_authenticate(user=self.user1)
        data = {
            'hs_code': self.hs_code.id,
            'input_snapshot': {'price': 100},
            'result_snapshot': {'total': 150}
        }
        res = self.client.post(self.calculations_url, data, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(SavedCalculation.objects.count(), 1)
        self.assertEqual(SavedCalculation.objects.first().user, self.user1)

    def test_list_own_calculations(self):
        SavedCalculation.objects.create(user=self.user1, hs_code=self.hs_code, input_snapshot={}, result_snapshot={})
        SavedCalculation.objects.create(user=self.user2, hs_code=self.hs_code, input_snapshot={}, result_snapshot={})
        
        self.client.force_authenticate(user=self.user1)
        res = self.client.get(self.calculations_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        # Should only return user1's calc (1 result out of 2 total)
        self.assertEqual(res.data['count'], 1)

    def test_cannot_delete_other_users_calculation(self):
        calc2 = SavedCalculation.objects.create(user=self.user2, hs_code=self.hs_code, input_snapshot={}, result_snapshot={})
        
        self.client.force_authenticate(user=self.user1)
        delete_url = reverse('calculation-delete', kwargs={'pk': calc2.pk})
        res = self.client.delete(delete_url)
        
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('permission to delete', res.data['error'])

    def test_fetch_own_profile(self):
        self.client.force_authenticate(user=self.user1)
        url = reverse('user-profile')
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['email'], 'user1@test.com')
        self.assertIn('id', res.data)
        self.assertIn('date_joined', res.data)

    def test_update_email_success(self):
        self.client.force_authenticate(user=self.user1)
        url = reverse('user-profile')
        res = self.client.patch(url, {'email': 'user1_new@test.com'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['email'], 'user1_new@test.com')
        # DB check
        self.user1.refresh_from_db()
        self.assertEqual(self.user1.email, 'user1_new@test.com')
        self.assertEqual(self.user1.username, 'user1_new@test.com')

    def test_update_email_duplicate(self):
        self.client.force_authenticate(user=self.user1)
        url = reverse('user-profile')
        # Try to use user2's email
        res = self.client.patch(url, {'email': 'user2@test.com'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', res.data)

    def test_change_password_success(self):
        self.client.force_authenticate(user=self.user1)
        url = reverse('change-password')
        data = {
            'current_password': 'password123!',
            'new_password': 'NewStrongPassword123!',
            'new_password_confirm': 'NewStrongPassword123!'
        }
        res = self.client.post(url, data, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['message'], 'Password updated successfully.')
        # Check login works with new password
        login_res = self.client.post(self.login_url, {
            'username': 'user1@test.com',
            'password': 'NewStrongPassword123!'
        }, format='json')
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)

    def test_change_password_wrong_current(self):
        self.client.force_authenticate(user=self.user1)
        url = reverse('change-password')
        data = {
            'current_password': 'wrongpassword!',
            'new_password': 'NewStrongPassword123!',
            'new_password_confirm': 'NewStrongPassword123!'
        }
        res = self.client.post(url, data, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('current_password', res.data)
