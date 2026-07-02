from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from accounts.models import UserProfile

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates a default admin user for the application'

    def handle(self, *args, **kwargs):
        email = 'admin@dutywise.co.zw'
        password = 'adminpassword123'

        if not User.objects.filter(email=email).exists():
            user = User.objects.create_superuser(
                email=email,
                password=password,
                first_name='System',
                last_name='Administrator',
                country='ZW'
            )
            # Create user profile
            UserProfile.objects.get_or_create(user=user, defaults={'company_name': 'DutyWise Admin'})
            
            self.stdout.write(self.style.SUCCESS(f'Successfully created admin user: {email}'))
            self.stdout.write(self.style.SUCCESS(f'Password: {password}'))
        else:
            self.stdout.write(self.style.WARNING(f'Admin user {email} already exists.'))
