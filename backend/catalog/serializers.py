from rest_framework import serializers
from .models import Elective, Program, ProgramLanguage

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