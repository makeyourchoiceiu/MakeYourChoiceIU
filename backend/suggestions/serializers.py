from rest_framework import serializers
from .models import Suggestion


class SuggestionCreateSerializer(serializers.ModelSerializer):
    """Used for POST /suggestions and PATCH /suggestions/edit/{token}"""

    class Meta:
        model = Suggestion
        fields = ['name', 'instructor', 'description', 'elective_language',
                  'format', 'prerequisite', 'contact']


class SuggestionSerializer(serializers.ModelSerializer):
    """Used for GET responses. edit_token is only visible to admins — passed via request context."""

    edit_token = serializers.SerializerMethodField()

    class Meta:
        model = Suggestion
        fields = ['id', 'name', 'instructor', 'description', 'elective_language',
                  'format', 'prerequisite', 'contact', 'status', 'edit_token', 'created_at']
        read_only_fields = fields

    def get_edit_token(self, obj):
        # is_admin is passed explicitly in context from the view
        if self.context.get('is_admin'):
            return str(obj.edit_token)
        return None
