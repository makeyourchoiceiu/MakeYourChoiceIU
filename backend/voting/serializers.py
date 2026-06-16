from rest_framework import serializers


class SubmissionElectiveSerializer(serializers.Serializer):
    priority = serializers.IntegerField(
        help_text='Priority rank for this elective (1 = highest preference)',
    )
    elective_id = serializers.IntegerField(
        help_text='ID of the chosen elective',
    )


class SubmissionSerializer(serializers.Serializer):
    student_id = serializers.IntegerField(
        help_text='ID of the student submitting the choice',
    )
    iteration_id = serializers.IntegerField(
        help_text='ID of the active iteration (voting round)',
    )
    elective_type = serializers.CharField(
        help_text='Elective type name being voted on (e.g. "Core")',
    )
    electives = SubmissionElectiveSerializer(
        many=True,
        help_text='Ordered list of elective choices with priority ranks',
    )
