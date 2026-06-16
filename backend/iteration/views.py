from rest_framework import viewsets, serializers as s
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

from drf_spectacular.utils import extend_schema, extend_schema_view, inline_serializer
from django.http import HttpResponse

from .models import Stream, StreamElectiveRelation, Iteration
from .serializers import StreamSerializer, IterationSerializer
from catalog.models import Elective, Program, Degree, ProgramLanguage, ElectiveType
from catalog.serializers import ElectiveSerializer

import openpyxl

@extend_schema_view(
    list=extend_schema(
        summary='List streams',
        description=(
            'Returns all voting streams. A stream defines a cohort of students '
            '(degree year + programs + language) and the elective type they vote on within an iteration.'
        ),
    ),
    create=extend_schema(
        summary='Create stream',
        description=(
            'Creates a new stream. A stream must be linked to an iteration via '
            '`POST /iterations/{id}/` or the iteration admin panel before it becomes active.'
        ),
    ),
    retrieve=extend_schema(
        summary='Get stream by ID',
    ),
    partial_update=extend_schema(
        summary='Partially update stream',
    ),
    update=extend_schema(
        summary='Update stream',
    ),
    destroy=extend_schema(
        summary='Delete stream',
        description='Deletes the stream. Does not delete associated electives.',
    ),
)
class StreamViewSet(viewsets.ModelViewSet):
    serializer_class = StreamSerializer
    queryset = Stream.objects.all()

    def get_queryset(self):
        return Stream.objects.all()

    @extend_schema(
        methods=['get'],
        summary='List electives in a stream',
        description='Returns all electives assigned to this stream that are available for voting.',
        responses={200: ElectiveSerializer(many=True)},
    )
    @extend_schema(
        methods=['post'],
        summary='Add electives to a stream',
        description=(
            'Assigns one or more electives to this stream. '
            'Existing assignments are preserved (idempotent — duplicates are silently ignored).'
        ),
        request=inline_serializer('AddElectivesRequest', fields={
            'electiveIds': s.ListField(
                child=s.IntegerField(help_text='Elective ID'),
                help_text='List of elective IDs to add to the stream',
            ),
        }),
        responses={
            200: inline_serializer('AddElectivesResponse', fields={
                'status': s.CharField(help_text='"added"'),
            }),
        },
    )
    @action(detail=True, methods=['get', 'post'], url_path='elective')
    def elective(self, request, pk=None):
        stream = self.get_object()
        if request.method.lower() == 'get':
            elective_ids = StreamElectiveRelation.objects.filter(
                stream_id=stream,
            ).values_list('elective_id', flat=True)
            electives = Elective.objects.filter(id__in=elective_ids)
            serializer = ElectiveSerializer(electives, many=True)
            return Response(serializer.data)

        elective_ids = request.data.get('electiveIds', [])
        electives = Elective.objects.filter(id__in=elective_ids)
        for elective in electives:
            StreamElectiveRelation.objects.get_or_create(
                stream_id=stream,
                elective_id=elective,
            )
        return Response({'status': 'added'})

    @extend_schema(
        summary='Remove elective from a stream',
        description='Removes the association between this stream and the specified elective.',
        responses={
            200: inline_serializer('RemoveElectiveResponse', fields={
                'status': s.CharField(help_text='"removed"'),
            }),
        },
    )
    @action(detail=True, methods=['delete'], url_path='elective/(?P<elective_id>[^/.]+)')
    def remove_elective(self, request, pk=None, elective_id=None):
        stream = self.get_object()
        StreamElectiveRelation.objects.filter(
            stream_id=stream,
            elective_id_id=elective_id,
        ).delete()
        return Response({'status': 'removed'})

class SemesterViewSet(viewsets.ViewSet):

    def list(self, request):
        iterations = Iteration.objects.all().order_by('-year', '-season')

        iteration_names = [
            f"{i.year}-{i.season}" for i in iterations
        ]

        active = Iteration.objects.filter(status=1).first()
        draft = Iteration.objects.filter(status=0).first()
        current = active or draft

        if not current:
            return Response({
                "iterations": iteration_names,
                "current_iteration": None,
                "settings": None
            })

        settings = {
            "electives": list(Elective.objects.all().values()),
            "programs": list(Program.objects.all().values()),
            "degrees": list(Degree.objects.all().values()),
            "languages": list(ProgramLanguage.objects.all().values()),
            "elective_types": list(ElectiveType.objects.all().values()),
        }

        return Response({
            "iterations": iteration_names,
            "current_iteration": {
                "id": current.id,
                "year": current.year,
                "season": current.season,
                "status": current.status,
                "deadline": current.deadline,
                "streams": list(current.streams.values())
            },
            "settings": settings
        })

    def retrieve(self, request, pk=None):
        try:
            i = Iteration.objects.get(pk=pk)
        except Iteration.DoesNotExist:
            return Response({"error": "not found"}, status=404)

        return Response({
            "id": i.id,
            "year": i.year,
            "season": i.season,
            "status": i.status,
            "deadline": i.deadline,
            "streams": list(i.streams.values())
        })

    def create(self, request):
        try:
            data = request.data

            iteration_raw = data.get("iteration")  # "26-SUM"
            study_year = data.get("study_year")
            program_language = data.get("program_language")
            programs = data.get("programs", [])
            electives = data.get("electives", [])
            elective_types = data.get("elective_types", [])
            status_flag = data.get("status", 0)

            year_str, season = iteration_raw.split("-")
            year = int(year_str)
            deadline = data.get("deadline")

            iteration = Iteration.objects.create(
                year=year,
                season=season,
                status=status_flag,
                deadline=deadline
            )

            created_streams = []

            for et in elective_types:
                elective_type_obj = ElectiveType.objects.get(pk=et)
                degree_obj = Degree.objects.get(pk=study_year)
                lang_obj = ProgramLanguage.objects.get(pk=program_language)

                stream = Stream.objects.create(
                    degree_year=degree_obj,
                    program_lang=lang_obj,
                    elective_type=elective_type_obj
                )

                program_objs = Program.objects.filter(name__in=programs)
                stream.programs.set(program_objs)

                for eid in electives:
                    elective_obj = Elective.objects.get(id=eid)
                    StreamElectiveRelation.objects.get_or_create(
                        stream_id=stream,
                        elective_id=elective_obj
                    )

                iteration.streams.add(stream)
                created_streams.append(stream.id)

            return Response({
                "status": "success",
                "iteration_id": iteration.id,
                "streams": created_streams
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                "status": "error",
                "message": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, pk=None):
        iteration = Iteration.objects.get(pk=pk)

        if "status" in request.data:
            iteration.status = request.data["status"]

        if "deadline" in request.data:
            iteration.deadline = request.data["deadline"]

        iteration.save()

        return Response({
            "status": "updated"
        })

    def destroy(self, request, pk=None):
        Iteration.objects.filter(pk=pk).delete()
        return Response({"status": "deleted"})

    @action(detail=True, methods=['get'], url_path='excel')
    def excel(self, request, pk=None):
        iteration = Iteration.objects.get(pk=pk)

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Semester"

        ws.append(["ID", "Year", "Season", "Status", "Deadline"])
        ws.append([
            iteration.id,
            iteration.year,
            iteration.season,
            iteration.status,
            str(iteration.deadline)
        ])

        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename=semester_{iteration.id}.xlsx'

        wb.save(response)
        return response