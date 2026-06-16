from rest_framework import viewsets, serializers as s
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from django.db.models import ProtectedError, Q
from django.db.models.deletion import RestrictedError
from rest_framework.views import APIView
from drf_spectacular.utils import (
    extend_schema, extend_schema_view, OpenApiParameter, OpenApiResponse, inline_serializer,
)
from drf_spectacular.types import OpenApiTypes

from .models import Elective, Program, ElectiveType, Track, ProgramLanguage, ElectiveTrackException
from .serializers import (
    ElectiveSerializer, ProgramSerializer, TrackSerializer, ElectiveTypeSerializer,
    ElectiveExceptionSerializer, TrackExceptionSerializer, ElectiveTrackExceptionSerializer,
)

_status_ok = inline_serializer('StatusOk', fields={'status': s.CharField(help_text='"success"')})
_status_err = inline_serializer('StatusError', fields={
    'status': s.CharField(help_text='"error"'),
    'message': s.CharField(help_text='Human-readable error description', required=False),
})


@extend_schema_view(
    list=extend_schema(
        summary='List electives',
        description=(
            'Returns all electives. Supports filtering and full-text search.\n\n'
            '**Status values:** `0` = draft, `1` = active, `2` = completed, `-1` = deleted.'
        ),
        parameters=[
            OpenApiParameter('status', OpenApiTypes.INT,
                             description='Filter by status: 0=draft, 1=active, 2=completed, -1=deleted'),
            OpenApiParameter('elective_type', OpenApiTypes.STR,
                             description='Filter by elective type name (PK of ElectiveType)'),
            OpenApiParameter('program_language', OpenApiTypes.STR,
                             description='Filter by program language code (e.g. "EN", "RU")'),
            OpenApiParameter('search', OpenApiTypes.STR,
                             description='Full-text search across name, description, and instructor'),
        ],
    ),
    create=extend_schema(
        summary='Create elective',
        description=(
            'Creates a new elective. The elective starts in draft status (`status=0`) by default.\n\n'
            '`elective_type` and `program_language` must reference existing objects. '
            '`program_language` can be omitted if the elective is available across all programs.'
        ),
        responses={201: _status_ok, 400: _status_err},
    ),
    retrieve=extend_schema(
        summary='Get elective by ID',
        description='Returns a single elective by its database ID.',
    ),
    partial_update=extend_schema(
        summary='Partially update elective',
        description=(
            'Updates one or more fields of an existing elective. All fields are optional. '
            'Use `PATCH /electives/{id}/archive/` to archive instead of setting status manually.'
        ),
        responses={200: _status_ok, 400: _status_err},
    ),
)
class ElectiveViewSet(viewsets.ModelViewSet):
    serializer_class = ElectiveSerializer
    queryset = Elective.objects.all()
    http_method_names = ['get', 'post', 'patch']

    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['status', 'elective_type', 'program_language']
    search_fields = ['name', 'description', 'instructor']

    def get_queryset(self):
        queryset = Elective.objects.all()
        status = self.request.query_params.get('status')
        if status is not None:
            queryset = queryset.filter(status=int(status))
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'status': 'success'}, status=201)
        return Response({'status': 'error'}, status=400)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'status': 'success'})
        return Response({'status': 'error'}, status=400)

    @extend_schema(
        summary='Archive elective',
        description=(
            'Sets the elective status to `0` (archived/draft). '
            'Prefer this over manual status patching to preserve a clear audit trail. '
            'Archived electives are excluded from active voting streams.'
        ),
        request=None,
        responses={200: inline_serializer('ArchiveResponse', fields={'status': s.CharField(help_text='"archived"')})},
    )
    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        elective = self.get_object()
        elective.status = 0
        elective.save()
        return Response({'status': 'archived'})


@extend_schema_view(
    list=extend_schema(
        summary='List programs',
        description='Returns all academic programs.',
    ),
    create=extend_schema(
        summary='Create program',
        description='Creates a new academic program linked to a program language.',
        responses={201: _status_ok, 400: _status_err},
    ),
    retrieve=extend_schema(
        summary='Get program by ID',
    ),
    partial_update=extend_schema(
        summary='Partially update program',
        responses={200: _status_ok, 400: _status_err},
    ),
    destroy=extend_schema(
        summary='Delete program',
        description='Permanently deletes a program. Cascades to associated tracks.',
        responses={200: _status_ok},
    ),
)
class ProgramViewSet(viewsets.ModelViewSet):
    serializer_class = ProgramSerializer
    queryset = Program.objects.all()
    http_method_names = ['get', 'post', 'patch', 'delete']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'status': 'success'}, status=201)
        return Response({'status': 'error'}, status=400)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'status': 'success'})
        return Response({'status': 'error'}, status=400)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({'status': 'success'}, status=200)


@extend_schema_view(
    list=extend_schema(
        summary='List tracks',
        description='Returns all tracks across all programs.',
    ),
    create=extend_schema(
        summary='Create track',
        description='Creates a new track under the specified program.',
        responses={201: _status_ok, 400: _status_err},
    ),
    retrieve=extend_schema(
        summary='Get track by ID',
    ),
    partial_update=extend_schema(
        summary='Partially update track',
        responses={200: _status_ok, 400: _status_err},
    ),
    destroy=extend_schema(
        summary='Delete track',
        description=(
            'Deletes a track. Returns `400` if the track is currently assigned to students — '
            'remove all student assignments before deleting.'
        ),
        responses={
            200: _status_ok,
            400: inline_serializer('TrackDeleteError', fields={
                'status': s.CharField(help_text='"error"'),
                'message': s.CharField(help_text='"Track is used by existing students"'),
            }),
        },
    ),
)
class TrackViewSet(viewsets.ModelViewSet):
    serializer_class = TrackSerializer
    queryset = Track.objects.all()
    http_method_names = ['get', 'post', 'patch', 'delete']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'status': 'success'}, status=201)
        return Response({'status': 'error'}, status=400)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'status': 'success'})
        return Response({'status': 'error'}, status=400)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.delete()
            return Response({'status': 'success'}, status=200)
        except (ProtectedError, RestrictedError):
            return Response(
                {'status': 'error', 'message': 'Track is used by existing students'},
                status=400,
            )


@extend_schema_view(
    list=extend_schema(
        summary='List elective types',
        description='Returns all elective types (e.g. "Core", "Optional").',
    ),
    create=extend_schema(
        summary='Create elective type',
        description=(
            'Creates a new elective type. The `elective_type_name` acts as the primary key '
            'and must be unique across the system.'
        ),
        responses={201: _status_ok, 400: _status_err},
    ),
    retrieve=extend_schema(
        summary='Get elective type by name',
    ),
    destroy=extend_schema(
        summary='Delete elective type',
        description=(
            'Deletes an elective type. Returns `400` if any electives still reference this type — '
            'reassign or delete those electives first.'
        ),
        responses={
            200: _status_ok,
            400: inline_serializer('ElectiveTypeDeleteError', fields={
                'status': s.CharField(help_text='"error"'),
                'message': s.CharField(help_text='"Elective type is used by existing electives"'),
            }),
        },
    ),
)
class ElectiveTypeViewSet(viewsets.ModelViewSet):
    serializer_class = ElectiveTypeSerializer
    queryset = ElectiveType.objects.all()
    http_method_names = ['get', 'post', 'delete']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'status': 'success'}, status=201)
        return Response({'status': 'error'}, status=400)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.delete()
            return Response({'status': 'success'})
        except (ProtectedError, RestrictedError):
            return Response(
                {'status': 'error', 'message': 'Elective type is used by existing electives'},
                status=400,
            )


@extend_schema(
    summary='Get system settings',
    description=(
        'Returns a combined snapshot of all configuration data needed to populate admin forms: '
        'program languages, programs (with their tracks), and elective types. '
        'Intended for use by the frontend to build dropdowns and filter controls.'
    ),
    responses={
        200: inline_serializer('SettingsResponse', fields={
            'languages': s.ListField(
                child=inline_serializer('LanguageEntry', fields={
                    'code': s.CharField(help_text='Language code (e.g. "EN")'),
                    'name': s.CharField(help_text='Language display name'),
                    'elective_types': s.ListField(
                        child=inline_serializer('ElectiveTypeEntry', fields={
                            'name': s.CharField(help_text='Elective type name'),
                        }),
                        help_text='All elective types in the system',
                    ),
                    'programs': s.ListField(
                        child=inline_serializer('ProgramEntry', fields={
                            'id': s.IntegerField(help_text='Program ID'),
                            'name': s.CharField(help_text='Program name'),
                            'language': s.CharField(help_text='Language code'),
                            'tracks': s.ListField(
                                child=inline_serializer('TrackEntry', fields={
                                    'id': s.IntegerField(help_text='Track ID'),
                                    'name': s.CharField(help_text='Track name'),
                                }),
                                help_text='Tracks belonging to this program',
                            ),
                        }),
                        help_text='Programs belonging to this language',
                    ),
                }),
                help_text='List of program languages with nested programs and tracks',
            ),
        }),
    },
)
@api_view(['GET'])
def settings(request):
    languages = ProgramLanguage.objects.all()
    result = []
    for lang in languages:
        programs = Program.objects.filter(language=lang)
        result.append({
            'code': lang.language,
            'name': lang.language,
            'elective_types': [
                {'name': et.elective_type_name}
                for et in ElectiveType.objects.all()
            ],
            'programs': [
                {
                    'id': program.id,
                    'name': program.name,
                    'language': program.language.language,
                    'tracks': [
                        {'id': track.id, 'name': track.name}
                        for track in program.track_set.all()
                    ],
                    'elective_type_settings': [],
                }
                for program in programs
            ],
        })
    return Response({'languages': result})


@extend_schema(tags=['exceptions'])
class ExceptionsView(APIView):

    @extend_schema(
        summary='List track exceptions',
        description=(
            'Returns three lists used by the exceptions management UI:\n\n'
            '- `exceptions` — existing elective/track exception pairs\n'
            '- `all_tracks` — all tracks in the system (for the "add exception" form)\n'
            '- `available_electives` — active electives that have no exception yet (candidates for new exceptions)\n\n'
            'An exception means a specific elective is **excluded** from a specific track\'s voting pool.'
        ),
        responses={
            200: inline_serializer('ExceptionsListResponse', fields={
                'exceptions': ElectiveTrackExceptionSerializer(many=True),
                'all_tracks': TrackExceptionSerializer(many=True),
                'available_electives': ElectiveExceptionSerializer(many=True),
            }),
        },
    )
    def get(self, request):
        exceptions = ElectiveTrackException.objects.select_related('elective', 'track').all()
        exception_serializer = ElectiveTrackExceptionSerializer(exceptions, many=True)
        all_tracks = Track.objects.all()
        tracks_serializer = TrackExceptionSerializer(all_tracks, many=True)
        elective_ids_with_exceptions = exceptions.values_list('elective_id', flat=True).distinct()
        remaining_electives = Elective.objects.filter(
            ~Q(id__in=elective_ids_with_exceptions), status=1
        )
        electives_serializer = ElectiveExceptionSerializer(remaining_electives, many=True)
        return Response({
            'exceptions': exception_serializer.data,
            'all_tracks': tracks_serializer.data,
            'available_electives': electives_serializer.data,
        })

    @extend_schema(
        summary='Create track exception',
        description=(
            'Marks an elective as excluded from a specific track\'s voting pool. '
            'Both `elective_id` and `track_id` are required. '
            'The elective must be active (`status=1`). '
            'Returns `400` if the exception already exists.'
        ),
        request=inline_serializer('ExceptionCreateRequest', fields={
            'elective_id': s.IntegerField(help_text='ID of the active elective to exempt'),
            'track_id': s.IntegerField(help_text='ID of the track to exclude the elective from'),
        }),
        responses={
            201: inline_serializer('ExceptionCreateResponse', fields={
                'status': s.CharField(help_text='"success"'),
                'message': s.CharField(),
                'data': ElectiveTrackExceptionSerializer(),
            }),
            400: _status_err,
            404: _status_err,
        },
    )
    def post(self, request):
        elective_id = request.data.get('elective_id')
        track_id = request.data.get('track_id')
        if not elective_id or not track_id:
            return Response(
                {'status': 'error', 'message': 'elective_id and track_id are required'},
                status=400,
            )
        try:
            elective = Elective.objects.get(id=elective_id)
        except Elective.DoesNotExist:
            return Response(
                {'status': 'error', 'message': f'Elective with id {elective_id} does not exist'},
                status=404,
            )
        try:
            track = Track.objects.get(id=track_id)
        except Track.DoesNotExist:
            return Response(
                {'status': 'error', 'message': f'Track with id {track_id} does not exist'},
                status=404,
            )
        if ElectiveTrackException.objects.filter(elective_id=elective_id, track_id=track_id).exists():
            return Response(
                {'status': 'error', 'message': 'This exception already exists'},
                status=400,
            )
        if elective.status != 1:
            return Response(
                {'status': 'error', 'message': 'Cannot create exception for archived or deleted elective'},
                status=400,
            )
        exception = ElectiveTrackException.objects.create(elective=elective, track=track)
        serializer = ElectiveTrackExceptionSerializer(exception)
        return Response(
            {'status': 'success', 'message': 'Exception created successfully', 'data': serializer.data},
            status=201,
        )

    @extend_schema(
        summary='Update track exception',
        description=(
            'Updates the elective or track of an existing exception. '
            'At least one of `elective_id` or `track_id` must be provided. '
            'The new elective must be active. '
            'Returns `400` if the updated combination already exists as another exception.'
        ),
        request=inline_serializer('ExceptionUpdateRequest', fields={
            'elective_id': s.IntegerField(help_text='New elective ID (optional)', required=False),
            'track_id': s.IntegerField(help_text='New track ID (optional)', required=False),
        }),
        responses={
            200: inline_serializer('ExceptionUpdateResponse', fields={
                'status': s.CharField(help_text='"success"'),
                'message': s.CharField(),
                'data': ElectiveTrackExceptionSerializer(),
            }),
            400: _status_err,
            404: _status_err,
        },
    )
    def patch(self, request, pk):
        try:
            exception = ElectiveTrackException.objects.get(id=pk)
        except ElectiveTrackException.DoesNotExist:
            return Response(
                {'status': 'error', 'message': f'Exception with id {pk} does not exist'},
                status=404,
            )
        elective_id = request.data.get('elective_id')
        track_id = request.data.get('track_id')
        if elective_id is None and track_id is None:
            return Response(
                {'status': 'error', 'message': 'At least one field (elective_id or track_id) is required'},
                status=400,
            )
        if elective_id is not None:
            try:
                new_elective = Elective.objects.get(id=elective_id)
            except Elective.DoesNotExist:
                return Response(
                    {'status': 'error', 'message': f'Elective with id {elective_id} does not exist'},
                    status=404,
                )
            if new_elective.status != 1:
                return Response(
                    {'status': 'error', 'message': 'Cannot use archived or deleted elective'},
                    status=400,
                )
            target_track_id = track_id if track_id is not None else exception.track_id
            if ElectiveTrackException.objects.filter(
                elective_id=elective_id, track_id=target_track_id
            ).exclude(id=pk).exists():
                return Response(
                    {'status': 'error', 'message': 'This combination already exists as another exception'},
                    status=400,
                )
            exception.elective = new_elective
        if track_id is not None:
            try:
                new_track = Track.objects.get(id=track_id)
            except Track.DoesNotExist:
                return Response(
                    {'status': 'error', 'message': f'Track with id {track_id} does not exist'},
                    status=404,
                )
            target_elective_id = elective_id if elective_id is not None else exception.elective_id
            if ElectiveTrackException.objects.filter(
                elective_id=target_elective_id, track_id=track_id
            ).exclude(id=pk).exists():
                return Response(
                    {'status': 'error', 'message': 'This combination already exists as another exception'},
                    status=400,
                )
            exception.track = new_track
        exception.save()
        serializer = ElectiveTrackExceptionSerializer(exception)
        return Response({
            'status': 'success',
            'message': 'Exception updated successfully',
            'data': serializer.data,
        })

    @extend_schema(
        summary='Delete track exception',
        description='Removes a track exception by ID. The elective becomes available again for that track.',
        responses={
            200: inline_serializer('ExceptionDeleteResponse', fields={
                'status': s.CharField(help_text='"success"'),
                'message': s.CharField(),
            }),
            404: _status_err,
        },
    )
    def delete(self, request, pk):
        try:
            exception = ElectiveTrackException.objects.get(id=pk)
        except ElectiveTrackException.DoesNotExist:
            return Response(
                {'status': 'error', 'message': f'Exception with id {pk} does not exist'},
                status=404,
            )
        exception.delete()
        return Response(
            {'status': 'success', 'message': f'Exception with id {pk} deleted successfully'},
            status=200,
        )
