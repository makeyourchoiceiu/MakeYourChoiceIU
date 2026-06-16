from rest_framework import serializers
from .models import Elective, Program, ProgramLanguage, Track, ElectiveType, ElectiveTrackException


class ElectiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Elective
        fields = '__all__'
        extra_kwargs = {
            'name': {'help_text': 'Full course name'},
            'instructor': {'help_text': 'Instructor full name'},
            'description': {'help_text': 'Detailed course description'},
            'elective_type': {'help_text': 'FK to ElectiveType (e.g. "Core", "Optional")'},
            'program_language': {'help_text': 'Target program language code (EN/RU). Null = available for all'},
            'elective_language': {'help_text': 'Language of instruction (e.g. "English", "Russian")'},
            'format': {'help_text': 'Delivery format: "online" or "offline"'},
            'status': {'help_text': '0 = draft, 1 = active, 2 = completed, -1 = deleted'},
            'degree_year': {'help_text': 'Target degree years (M1, M2, B1, etc.)'},
            'prerequisite': {'help_text': 'Prerequisites for enrollment. Empty string if none'},
        }


class ProgramSerializer(serializers.ModelSerializer):
    language = serializers.PrimaryKeyRelatedField(
        queryset=ProgramLanguage.objects.all(),
        help_text='Language code this program belongs to (e.g. "EN")',
    )

    class Meta:
        model = Program
        fields = '__all__'
        extra_kwargs = {
            'name': {'help_text': 'Program name (e.g. "Software Engineering")'},
        }


class TrackSerializer(serializers.ModelSerializer):
    program = serializers.PrimaryKeyRelatedField(
        queryset=Program.objects.all(),
        help_text='ID of the parent program',
    )

    class Meta:
        model = Track
        fields = '__all__'
        extra_kwargs = {
            'name': {'help_text': 'Track short name (e.g. "SE", "DS")'},
        }


class ElectiveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ElectiveType
        fields = '__all__'
        extra_kwargs = {
            'elective_type_name': {'help_text': 'Unique type name used as primary key (e.g. "Core", "Optional")'},
        }


class TrackExceptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Track
        fields = ['id', 'name']


class ElectiveExceptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Elective
        fields = ['id', 'name']


class ElectiveTrackExceptionSerializer(serializers.ModelSerializer):
    elective = ElectiveExceptionSerializer(read_only=True)
    track = TrackExceptionSerializer(read_only=True)

    elective_id = serializers.PrimaryKeyRelatedField(
        queryset=Elective.objects.all(),
        source='elective',
        write_only=True,
        required=False,
        help_text='ID of the elective to exempt',
    )
    track_id = serializers.PrimaryKeyRelatedField(
        queryset=Track.objects.all(),
        source='track',
        write_only=True,
        required=False,
        help_text='ID of the track to exempt the elective from',
    )

    class Meta:
        model = ElectiveTrackException
        fields = ['id', 'elective', 'elective_id', 'track', 'track_id', 'created_at']
        read_only_fields = ['id', 'created_at']
