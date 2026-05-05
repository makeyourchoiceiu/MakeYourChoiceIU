from rest_framework import viewsets
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from django.db.models import ProtectedError, Q
from rest_framework.views import APIView


from .models import Elective, Program, ElectiveType, Track, ProgramLanguage, ElectiveTrackException
from .serializers import ElectiveSerializer, ProgramSerializer, TrackSerializer, ElectiveTypeSerializer, ElectiveExceptionSerializer, TrackExceptionSerializer, ElectiveTrackExceptionSerializer

class ElectiveViewSet(viewsets.ModelViewSet):
    serializer_class = ElectiveSerializer
    queryset = Elective.objects.all()

    http_method_names = ['get', 'post', 'patch']

    def get_queryset(self):
        queryset = Elective.objects.all()
        status = self.request.query_params.get('status')

        if status is not None:
            queryset = queryset.filter(status=int(status))

        return queryset

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter
    ]

    filterset_fields = [
        'status',
        'elective_type',
        'program_language'
    ]

    search_fields = [
        'name',
        'description',
        'instructor'
    ]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response({"status": "success"}, status=201)

        return Response({"status": "error"}, status=400)
    
    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response({"status": "success"})

        return Response({"status": "error"}, status=400)


    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        elective = self.get_object()
        elective.status = 0
        elective.save()

        return Response({"status" : "archived"})
    
class ProgramViewSet(viewsets.ModelViewSet):
    serializer_class = ProgramSerializer
    queryset = Program.objects.all()

    http_method_names = ['get', 'post', 'patch', 'delete']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response({"status": "success"}, status=201)
        
        return Response({"status": "error"}, status=400)
    
    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response({"status": "success"})

        return Response({"status": "error"}, status=400)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({"status": "success"}, status=200)

class TrackViewSet(viewsets.ModelViewSet):
    serializer_class = TrackSerializer
    queryset = Track.objects.all()

    http_method_names = ['get', 'post', 'patch', 'delete']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response({"status": "success"}, status=201)

        return Response({"status": "error"}, status=400)
    
    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response({"status": "success"})

        return Response({"status": "error"}, status=400)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({"status": "success"}, status=200)

class ElectiveTypeViewSet(viewsets.ModelViewSet):
    serializer_class = ElectiveTypeSerializer
    queryset = ElectiveType.objects.all()

    http_method_names = ['get', 'post', 'delete']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response({"status": "success"}, status=201)

        return Response({"status": "error"}, status=400)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.delete()
            return Response({"status": "success"})
        except ProtectedError:
            return Response({"status": "error"}, status=400)

@api_view(['GET'])
def settings(request):
    languages = ProgramLanguage.objects.all()

    result = []

    for lang in languages:
        programs = Program.objects.filter(language=lang)

        result.append({
            "code": lang.language,
            "name": lang.language,

            "elective_types": [
                {"name": et.elective_type_name}
                for et in ElectiveType.objects.all()
            ],

            "programs": [
                {
                    "id": program.id,
                    "name": program.name,
                    "language": program.language.language,
                    "tracks": [
                        {
                            "id": track.id,
                            "name": track.name
                        }
                        for track in program.track_set.all()
                    ],
                    "elective_type_settings": []  # пока заглушка
                }
                for program in programs
            ]
        })

    return Response({
        "languages": result
    })


class ExceptionsView(APIView):
    def get(self, request):

        exceptions = ElectiveTrackException.objects.select_related('elective', 'track').all()
        exception_serializer = ElectiveTrackExceptionSerializer(exceptions, many=True)

        all_tracks = Track.objects.all()
        tracks_serializer = TrackExceptionSerializer(all_tracks, many=True)

        elective_ids_with_exceptions = exceptions.values_list('elective_id', flat=True).distinct()

        remaining_electives = Elective.objects.filter(
            ~Q(id__in=elective_ids_with_exceptions),
            status=1
        )
        electives_serializer = ElectiveExceptionSerializer(remaining_electives, many=True)

        return Response({
            "exceptions": exception_serializer.data,
            "all_tracks": tracks_serializer.data,
            "available_electives": electives_serializer.data
        })

    def post(self, request):
        elective_id = request.data.get('elective_id')
        track_id = request.data.get('track_id')

        if not elective_id or not track_id:
            return Response(
                {"status": "error", "message": "elective_id and track_id are required"},
                status=400
            )

        try:
            elective = Elective.objects.get(id=elective_id)
        except Elective.DoesNotExist:
            return Response(
                {"status": "error", "message": f"Elective with id {elective_id} does not exist"},
                status=404
            )

        try:
            track = Track.objects.get(id=track_id)
        except Track.DoesNotExist:
            return Response(
                {"status": "error", "message": f"Track with id {track_id} does not exist"},
                status=404
            )

        if ElectiveTrackException.objects.filter(elective_id=elective_id, track_id=track_id).exists():
            return Response(
                {"status": "error", "message": "This exception already exists"},
                status=400
            )

        if elective.status != 1:
            return Response(
                {"status": "error", "message": "Cannot create exception for archived or deleted elective"},
                status=400
            )

        exception = ElectiveTrackException.objects.create(
            elective=elective,
            track=track
        )

        serializer = ElectiveTrackExceptionSerializer(exception)
        return Response(
            {
                "status": "success",
                "message": "Exception created successfully",
                "data": serializer.data
            },
            status=201
        )

    def patch(self, request, pk):
        try:
            exception = ElectiveTrackException.objects.get(id=pk)
        except ElectiveTrackException.DoesNotExist:
            return Response(
                {"status": "error", "message": f"Exception with id {pk} does not exist"},
                status=404
            )

        elective_id = request.data.get('elective_id')
        track_id = request.data.get('track_id')

        if elective_id is None and track_id is None:
            return Response(
                {"status": "error", "message": "At least one field (elective_id or track_id) is required"},
                status=400
            )

        if elective_id is not None:
            try:
                new_elective = Elective.objects.get(id=elective_id)
            except Elective.DoesNotExist:
                return Response(
                    {"status": "error", "message": f"Elective with id {elective_id} does not exist"},
                    status=404
                )

            if new_elective.status != 1:
                return Response(
                    {"status": "error", "message": "Cannot use archived or deleted elective"},
                    status=400
                )

            target_track_id = track_id if track_id is not None else exception.track_id
            if ElectiveTrackException.objects.filter(
                    elective_id=elective_id,
                    track_id=target_track_id
            ).exclude(id=pk).exists():
                return Response(
                    {"status": "error", "message": "This combination already exists as another exception"},
                    status=400
                )

            exception.elective = new_elective

        if track_id is not None:
            try:
                new_track = Track.objects.get(id=track_id)
            except Track.DoesNotExist:
                return Response(
                    {"status": "error", "message": f"Track with id {track_id} does not exist"},
                    status=404
                )

            target_elective_id = elective_id if elective_id is not None else exception.elective_id
            if ElectiveTrackException.objects.filter(
                    elective_id=target_elective_id,
                    track_id=track_id
            ).exclude(id=pk).exists():
                return Response(
                    {"status": "error", "message": "This combination already exists as another exception"},
                    status=400
                )

            exception.track = new_track

        exception.save()

        serializer = ElectiveTrackExceptionSerializer(exception)
        return Response({
            "status": "success",
            "message": "Exception updated successfully",
            "data": serializer.data
        })

    def delete(self, request, pk):
        try:
            exception = ElectiveTrackException.objects.get(id=pk)
        except ElectiveTrackException.DoesNotExist:
            return Response(
                {"status": "error", "message": f"Exception with id {pk} does not exist"},
                status=404
            )

        # exception_data = ElectiveTrackExceptionSerializer(exception).data

        exception.delete()

        return Response({
            "status": "success",
            "message": f"Exception with id {pk} deleted successfully"
            # "deleted_exception": exception_data
        }, status=200)
