from rest_framework import viewsets
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from django.db.models import ProtectedError

from .models import Elective, Program, ElectiveType, Track, ProgramLanguage
from .serializers import ElectiveSerializer, ProgramSerializer, TrackSerializer, ElectiveTypeSerializer

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