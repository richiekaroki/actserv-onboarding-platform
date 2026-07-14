from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = 'Create a default admin user if none exists'

    def handle(self, *args, **options):
        User = get_user_model()
        if User.objects.filter(is_staff=True).exists():
            self.stdout.write(self.style.WARNING('Admin user already exists — skipping'))
            return

        User.objects.create_superuser(
            email='admin@actserv.local',
            password='admin1234!',
            first_name='Admin',
            last_name='User',
            role='admin',
        )
        self.stdout.write(self.style.SUCCESS('Created admin user: admin@actserv.local / admin1234!'))
