from django.db.models import Count
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter

from .models import Elective, Program, ElectiveType, Track
from .serializers import ElectiveSerializer, ProgramSerializer

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

        if instance is not None:
            instance.delete()
            return Response({"status": "success"})
        return Response({"status": "error"}, status=400)