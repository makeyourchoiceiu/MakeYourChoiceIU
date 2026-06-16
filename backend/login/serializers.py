from rest_framework import serializers
from catalog.models import Elective


class AdminElectiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Elective
        fields = '__all__'


class StudentElectiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Elective
        fields = ['id', 'name', 'instructor', 'description', 'elective_language', 'prerequisite']


class AvailableElectivesSerializer(serializers.Serializer):
    elective_type = serializers.CharField(
        help_text='Elective type name (e.g. "Core")',
    )
    priorities = serializers.IntegerField(
        help_text='Number of priority choices the student must submit for this type',
    )
    electives = StudentElectiveSerializer(
        many=True,
        help_text='Electives available to this student for the given type',
    )


class ChosenConcreteTypeElectivesSerializer(serializers.Serializer):
    priority = serializers.IntegerField(
        help_text='Priority rank assigned by the student (1 = highest)',
    )
    elective = StudentElectiveSerializer(
        help_text='Elective details',
    )


class ChosenElectivesSerializer(serializers.Serializer):
    elective_type = serializers.CharField(
        help_text='Elective type name',
    )
    electives = ChosenConcreteTypeElectivesSerializer(
        many=True,
        help_text='Latest submitted choices for this elective type',
    )


class StudentDataSerializer(serializers.Serializer):
    iteration_id = serializers.IntegerField(
        help_text='ID of the currently active iteration. Null if no active iteration',
    )
    deadline = serializers.DateTimeField(
        allow_null=True,
        help_text='Voting deadline (ISO 8601). Null if no active iteration',
    )
    available_electives = AvailableElectivesSerializer(
        many=True,
        help_text='Electives available to the student grouped by elective type',
    )
    chosen_electives = ChosenElectivesSerializer(
        many=True,
        help_text='Latest submitted choices grouped by elective type',
    )


class StudentResponseSerializer(serializers.Serializer):
    student_id = serializers.IntegerField(help_text='Student database ID')
    role = serializers.CharField(help_text='"student"')
    email = serializers.CharField(help_text='Authenticated student email')
    student_data = StudentDataSerializer()


class AdminResponseSerializer(serializers.Serializer):
    role = serializers.CharField(help_text='"admin"')
    email = serializers.CharField(help_text='Authenticated admin email')
    all_electives = AdminElectiveSerializer(
        many=True,
        help_text='All electives in the system (for admin management)',
    )


class AdminStudentResponseSerializer(serializers.Serializer):
    role = serializers.CharField(help_text='"admin-student" — user has both admin and student access')
    email = serializers.CharField(help_text='Authenticated user email')
    all_electives = AdminElectiveSerializer(
        many=True,
        help_text='All electives in the system',
    )
    student_data = StudentDataSerializer()
