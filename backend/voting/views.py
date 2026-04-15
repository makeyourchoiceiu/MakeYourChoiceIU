from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from django.db import transaction

from catalog.models import Elective, ElectiveType
from iteration.models import Iteration, StreamElectiveRelation
from login.models import Student
from .models import History

from .serializers import SubmissionSerializer


@api_view(["POST"])
def submit_electives(request):
    serializer = SubmissionSerializer(data=request.data)

    if not serializer.is_valid():
        return Response({"errors": serializer.errors}, status=400)

    data = serializer.validated_data

    student_id = data["student_id"]
    iteration_id = data["iteration_id"]
    elective_type_name = data["elective_type"]
    electives = data["electives"]

    # existence
    try:
        student = Student.objects.get(id=student_id)
        iteration = Iteration.objects.get(id=iteration_id)
        elective_type = ElectiveType.objects.get(elective_type_name=elective_type_name)
    except Student.DoesNotExist:
        return Response({"error": "Student not found"}, status=404)
    except Iteration.DoesNotExist:
        return Response({"error": "Iteration not found"}, status=404)
    except ElectiveType.DoesNotExist:
        return Response({"error": "Elective type not found"}, status=404)
    
    # deadline passed
    # if iteration.deadline < timezone.now():
        # return Response({"error": "Deadline passed"}, status=400)
    
    # duplicates
    elective_ids = [e["elective_id"] for e in electives]

    if len(elective_ids) != len(set(elective_ids)):
        return Response({"error": "Duplicate electives"}, status=400)
    
    # active electives
    active_count = Elective.objects.filter(
        id__in=elective_ids,
        status=1
    ).count()

    if active_count != len(elective_ids):
        return Response({"error": "Some electives are not active"}, status=400)

    # allowed electives
    streams = iteration.streams.filter(
        degree_year=student.degree_year,
        programs=student.program,
        elective_type=elective_type
    )

    allowed = StreamElectiveRelation.objects.filter(
        stream_id__in=streams,
        elective_id__in=elective_ids
    ).values_list("elective_id", flat=True)

    if set(elective_ids) != set(allowed):
        return Response({"error": "Some electives are not allowed"}, status=400)


    # adding choice
    with transaction.atomic():
        # block
        History.objects.select_for_update().filter(
            student=student,
            iteration=iteration,
            elective_type=elective_type
        )

        now = timezone.now()

        history_objects = []

        for item in electives:
            elective_id = item["elective_id"]
            priority = item["priority"]

            try:
                elective = Elective.objects.get(id=elective_id)
            except Elective.DoesNotExist:
                return Response({"error": f"Elective {elective_id} not found"}, status=404)

            history_objects.append(
                History(
                    student=student,
                    iteration=iteration,
                    elective_type=elective_type,
                    elective=elective,
                    priority=priority,
                    date=now
                )
            )
        History.objects.bulk_create(history_objects)

    return Response({"status": "success"}, status=201)
