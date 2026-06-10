from rest_framework import serializers
from .models import Stream
from catalog.models import Program


class StreamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stream
        fields = '__all__'
        extra_kwargs = {
            'degree_year': {'help_text': 'Target degree year (FK to Degree, e.g. "M1")'},
            'program_lang': {'help_text': 'Target program language (FK to ProgramLanguage, e.g. "EN")'},
            'elective_type': {'help_text': 'Elective type this stream covers (FK to ElectiveType)'},
            'programs': {'help_text': 'Programs included in this stream'},
            'priorities': {'help_text': 'Number of priority choices students must submit (default: 5)'},
        }


class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = '__all__'
