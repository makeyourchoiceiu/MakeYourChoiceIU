from rest_framework import serializers
from .models import Admin, Student
from catalog.models import Elective
from iteration.models import Stream, Iteration, StreamElectiveRelation
from voting.models import History

class AdminElectiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Elective
        fields = '__all__'

class StudentElectiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Elective
        fields = [
            "id",
            "name",
            "instructor",
            "description",
            "elective_language",
            "prerequisite"
        ]

class AvailableElectivesSerializer(serializers.Serializer):
    elective_type = serializers.CharField()
    priorities = serializers.IntegerField()
    electives = StudentElectiveSerializer(many=True)

class ChosenConcreteTypeElectivesSerializer(serializers.Serializer):
    priority = serializers.IntegerField()
    elective = StudentElectiveSerializer()

class ChosenElectivesSerializer(serializers.Serializer):
    elective_type = serializers.CharField()
    electives = ChosenConcreteTypeElectivesSerializer(many=True)

class StudentDataSerializer(serializers.Serializer):
    deadline = serializers.DateTimeField(allow_null=True)
    available_electives = AvailableElectivesSerializer(many=True)
    chosen_electives = ChosenElectivesSerializer(many=True)

class StudentResponseSerializer(serializers.Serializer):
    role = serializers.CharField()
    email = serializers.CharField()
    student_data = StudentDataSerializer()

class AdminResponseSerializer(serializers.Serializer):
    role = serializers.CharField()
    email = serializers.CharField()
    all_electives = AdminElectiveSerializer(many=True)

class AdminStudentResponseSerializer(serializers.Serializer):
    role = serializers.CharField()
    email = serializers.CharField()
    all_electives = AdminElectiveSerializer(many=True)
    student_data = StudentDataSerializer()
