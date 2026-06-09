from rest_framework import serializers
from .models import Suggestion


class SuggestionCreateSerializer(serializers.ModelSerializer):
    """Используется для POST /suggestions и PATCH /suggestions/edit/{token}"""

    class Meta:
        model = Suggestion
        fields = ['name', 'instructor', 'description', 'elective_language',
                  'format', 'prerequisite', 'contact']


class SuggestionSerializer(serializers.ModelSerializer):
    """Используется для GET-ответов. edit_token видит только админ — передаётся через контекст."""

    edit_token = serializers.SerializerMethodField()

    class Meta:
        model = Suggestion
        fields = ['id', 'name', 'instructor', 'description', 'elective_language',
                  'format', 'prerequisite', 'contact', 'status', 'edit_token', 'created_at']
        read_only_fields = fields

    def get_edit_token(self, obj):
        request = self.context.get('request')
        if request and getattr(request, 'is_admin', False):
            return str(obj.edit_token)
        return None
