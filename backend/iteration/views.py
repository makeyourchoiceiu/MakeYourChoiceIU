from rest_framework import viewsets, serializers as s
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, extend_schema_view, inline_serializer

from .models import Stream, StreamElectiveRelation
from .serializers import StreamSerializer
from catalog.models import Elective
from catalog.serializers import ElectiveSerializer


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
