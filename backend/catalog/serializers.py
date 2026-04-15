from rest_framework import serializers
from .models import Elective

class ElectiveSerializer(serializers.ModelSerializer):

    class Meta:
        model = Elective
        fields = '__all__'