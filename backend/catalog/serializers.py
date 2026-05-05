from rest_framework import serializers
from .models import Elective, Program, ProgramLanguage, Track, ElectiveType

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