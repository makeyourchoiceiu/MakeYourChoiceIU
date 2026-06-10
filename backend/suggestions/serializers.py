from rest_framework import serializers
from .models import Suggestion


class SuggestionCreateSerializer(serializers.ModelSerializer):
    """Request body for POST /suggestions and PATCH /suggestions/edit/{token}."""

    class Meta:
        model = Suggestion
        fields = ['name', 'instructor', 'description', 'elective_language',
                  'format', 'prerequisite', 'contact']
        extra_kwargs = {
            'name': {'help_text': 'Proposed course name'},
            'instructor': {'help_text': 'Suggested instructor full name'},
            'description': {'help_text': 'Course description and goals'},
            'elective_language': {'help_text': 'Language of instruction (e.g. "English")'},
            'format': {'help_text': 'Delivery format: "online" or "offline"'},
            'prerequisite': {'help_text': 'Prerequisite knowledge. Empty string if none'},
            'contact': {'help_text': 'Author contact info (email, Telegram, etc.)'},
        }


class SuggestionSerializer(serializers.ModelSerializer):
    """Response body for GET /suggestions and GET /suggestions/edit/{token}."""

    class Meta:
        model = Suggestion
        fields = ['id', 'name', 'instructor', 'description', 'elective_language',
                  'format', 'prerequisite', 'contact', 'status', 'edit_token', 'created_at']
        read_only_fields = fields
        extra_kwargs = {
            'id': {'help_text': 'Auto-generated suggestion ID'},
            'status': {'help_text': 'Review status: "pending", "approved", or "rejected"'},
            'edit_token': {'help_text': 'UUID token used to access the edit page without authentication'},
            'created_at': {'help_text': 'ISO 8601 timestamp of submission'},
        }
