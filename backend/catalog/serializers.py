from rest_framework import serializers
from .models import Elective, Program, ProgramLanguage, Track, ElectiveType, ElectiveTrackException

class ElectiveSerializer(serializers.ModelSerializer):

    class Meta:
        model = Elective
        fields = '__all__'

class ProgramSerializer(serializers.ModelSerializer):
    language = serializers.PrimaryKeyRelatedField(
        queryset=ProgramLanguage.objects.all()
    )

    class Meta:
        model = Program
        fields = '__all__'
    
class TrackSerializer(serializers.ModelSerializer):
    program = serializers.PrimaryKeyRelatedField(
        queryset=Program.objects.all()
    )

    class Meta:
        model = Track
        fields = '__all__'

class ElectiveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ElectiveType
        fields = '__all__'

class TrackExceptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Track
        fields = ['id', 'name']

class ElectiveExceptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Elective
        fields = ['id', 'name']


class ElectiveTrackExceptionSerializer(serializers.ModelSerializer):
    #for GET
    elective = ElectiveExceptionSerializer(read_only=True)
    track = TrackExceptionSerializer(read_only=True)

    #for POST/PATCH
    elective_id = serializers.PrimaryKeyRelatedField(
        queryset=Elective.objects.all(),
        source='elective',
        write_only=True,
        required=False
    )
    track_id = serializers.PrimaryKeyRelatedField(
        queryset=Track.objects.all(),
        source='track',
        write_only=True,
        required=False
    )

    class Meta:
        model = ElectiveTrackException
        fields = ['id', 'elective', 'elective_id', 'track', 'track_id', 'created_at']
        read_only_fields = ['id', 'created_at']