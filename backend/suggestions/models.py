import uuid
from django.db import models
from catalog.models import Elective


class Suggestion(models.Model):
    FORMAT_CHOICES = [('online', 'online'), ('offline', 'offline')]
    STATUS_CHOICES = [('pending', 'pending'), ('approved', 'approved'), ('rejected', 'rejected')]

    name = models.CharField(max_length=200)
    instructor = models.CharField(max_length=100)
    description = models.TextField()
    elective_language = models.CharField(max_length=20)
    format = models.CharField(max_length=10, choices=FORMAT_CHOICES)
    prerequisite = models.TextField(blank=True)
    contact = models.CharField(max_length=200)

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    edit_token = models.UUIDField(default=uuid.uuid4, unique=True)
    elective = models.ForeignKey(Elective, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.name} ({self.status})'
