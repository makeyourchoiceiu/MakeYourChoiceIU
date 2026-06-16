from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('catalog', '0005_add_electives'),
    ]

    operations = [
        migrations.CreateModel(
            name='Suggestion',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=200)),
                ('instructor', models.CharField(max_length=100)),
                ('description', models.TextField()),
                ('elective_language', models.CharField(max_length=20)),
                ('format', models.CharField(max_length=10, choices=[('online', 'online'), ('offline', 'offline')])),
                ('prerequisite', models.TextField(blank=True)),
                ('contact', models.CharField(max_length=200)),
                ('status', models.CharField(max_length=10, choices=[('pending', 'pending'), ('approved', 'approved'), ('rejected', 'rejected')], default='pending')),
                ('edit_token', models.UUIDField(default=uuid.uuid4, unique=True)),
                ('elective', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='catalog.elective')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
