from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import serializers as s
from django.utils import timezone
from django.db import transaction
from drf_spectacular.utils import extend_schema, inline_serializer

from catalog.models import Elective, ElectiveType
from iteration.models import Iteration, StreamElectiveRelation
from login.models import Student
from .models import History
from .serializers import SubmissionSerializer


@extend_schema(
    summary='Submit elective choices',
    description=(
        'Records the student\'s ranked elective choices for a specific elective type within an active iteration.\n\n'
        '**Validation rules:**\n'
        '- `student_id`, `iteration_id`, and `elective_type` must reference existing records\n'
        '- No duplicate `elective_id` values within the same submission\n'
        '- All submitted electives must be active (`status=1`)\n'
        '- All submitted electives must be allowed for the student\'s degree year, program, and elective type '
        'within the given iteration\n\n'
        'Submitting again for the same student/iteration/elective_type combination overwrites the previous choice '
        '(a new History batch is created; the latest batch by timestamp is the current choice).'
    ),
    request=SubmissionSerializer,
    responses={
        201: inline_serializer('SubmitSuccess', fields={
            'status': s.CharField(help_text='"success"'),
        }),
        400: inline_serializer('SubmitError', fields={
            'errors': s.DictField(
                help_text='Validation errors (field-level), or a top-level "error" key for business logic errors',
                required=False,
            ),
            'error': s.CharField(
                help_text='Business logic error message (e.g. "Duplicate electives")',
                required=False,
            ),
        }),
        404: inline_serializer('SubmitNotFound', fields={
            'error': s.CharField(help_text='Not-found message (e.g. "Student not found")'),
        }),
    },
)
@api_view(['POST'])
def submit_electives(request):
    serializer = SubmissionSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'errors': serializer.errors}, status=400)

    data = serializer.validated_data
    student_id = data['student_id']
    iteration_id = data['iteration_id']
    elective_type_name = data['elective_type']
    electives = data['electives']

    try:
        student = Student.objects.get(id=student_id)
        iteration = Iteration.objects.get(id=iteration_id)
        elective_type = ElectiveType.objects.get(elective_type_name=elective_type_name)
    except Student.DoesNotExist:
        return Response({'error': 'Student not found'}, status=404)
    except Iteration.DoesNotExist:
        return Response({'error': 'Iteration not found'}, status=404)
    except ElectiveType.DoesNotExist:
        return Response({'error': 'Elective type not found'}, status=404)

    elective_ids = [e['elective_id'] for e in electives]
    if len(elective_ids) != len(set(elective_ids)):
        return Response({'error': 'Duplicate electives'}, status=400)

    active_count = Elective.objects.filter(id__in=elective_ids, status=1).count()
    if active_count != len(elective_ids):
        return Response({'error': 'Some electives are not active'}, status=400)

    streams = iteration.streams.filter(
        degree_year=student.degree_year,
        programs=student.program,
        elective_type=elective_type,
    )
    allowed = StreamElectiveRelation.objects.filter(
        stream_id__in=streams, elective_id__in=elective_ids,
    ).values_list('elective_id', flat=True)
    if set(elective_ids) != set(allowed):
        return Response({'error': 'Some electives are not allowed'}, status=400)

    with transaction.atomic():
        History.objects.select_for_update().filter(
            student=student, iteration=iteration, elective_type=elective_type,
        )
        now = timezone.now()
        history_objects = []
        for item in electives:
            elective_id = item['elective_id']
            priority = item['priority']
            try:
                elective = Elective.objects.get(id=elective_id)
            except Elective.DoesNotExist:
                return Response({'error': f'Elective {elective_id} not found'}, status=404)
            history_objects.append(
                History(
                    student=student,
                    iteration=iteration,
                    elective_type=elective_type,
                    elective=elective,
                    priority=priority,
                    date=now,
                )
            )
        History.objects.bulk_create(history_objects)

    return Response({'status': 'success'}, status=201)
