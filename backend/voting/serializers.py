from rest_framework import serializers

class SubmissionElectiveSerializer(serializers.Serializer):
    priority = serializers.IntegerField()
    elective_id = serializers.IntegerField()


class SubmissionSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()
    iteration_id = serializers.IntegerField()
    elective_type = serializers.CharField()
    electives = SubmissionElectiveSerializer(many=True)