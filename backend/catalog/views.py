from django.db.models import Count
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter

from .models import Elective, Program, ElectiveType, Track
from .serializers import ElectiveSerializer

class ElectiveViewSet(viewsets.ModelViewSet):
    serializer_class = ElectiveSerializer
    queryset = Elective.objects.all()

    def get_queryset(self):
        queryset = Elective.objects.all()
        status = self.request.query_params.get('status')

        if status:
            queryset = queryset.filter(status=status)

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

        return Response({
            "status": "error",
            "errors": serializer.errors
        }, status=400)
    
    def partial_update(self, request, *args, **kwargs):

        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response({"status": "success"})

        return Response({
            "status": "error",
            "errors": serializer.errors
        }, status=400)
    
    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.delete()
            return Response({"status": "success"})
        except Elective.DoesNotExist:
            return Response({
            "status": "error"
        }, status=404)


    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        elective = self.get_object()
        elective.status = 0
        elective.save()

        return Response({"status" : "archived"})
    
class SettingsViewSet(viewsets.ViewSet):
    # POST command
    @action(detail=False, methods=['post'], url_path='program')
    def create_program(self, request):
        name = request.data.get("name")
        language = request.data.get("language")

        if not name or not language:
            return Response({"status": "error"}, status=400)

        try:
            Program.objects.create(
                name=name,
                language_id=language
            )
            return Response({"status": "success"}, status=201)
        except:
            return Response({"status": "error"}, status=400)

    @action(detail=False, methods=['post'], url_path='elective_type')
    def create_elective_type(self, request):
        name = request.data.get("elective_type_name")

        if not name:
            return Response({"status": "error"}, status=400)
        
        try:
            ElectiveType.objects.create(elective_type_name=name)
            return Response({"status": "success"}, status=201)
        except:
            return Response({"status": "error"}, status=400)
            

    @action(detail=False, methods=['post'], url_path='track')
    def create_track(self, request):
        name = request.data.get("name")
        program = request.data.get("program")

        if not name or not program:
            return Response({"status": "error"}, status=400)
        
        try:
            program_obj = Program.objects.get(id=program)
            Track.objects.create(
                name=name,
                program=program_obj)
            return Response({"status": "success"}, status=201)
        except Exception as e:
            return Response({"status": "error","error": str(e)}, status=400)
    
    # PATCH command
    @action(detail=True, methods=['patch'], url_path='program')
    def update_program(self, request, pk=None):
        try:
            program = Program.objects.get(id=pk)
            name = request.data.get('name')
            language = request.data.get('language')

            if name:
                program.name = name
            if language:
                program.language_id = language
            program.save()
            return Response({"status": "success"})
        
        except Program.DoesNotExist:
            return Response({"status": "error"}, status=404)
        except Exception as e:
            return Response({
                'status' : 'error',
                'error' : str(e)
            }, status=400)


    @action(detail=True, methods=['patch'], url_path='elective_type')
    def update_elective_type(self, request, pk=None):
        try:
            elective_type = ElectiveType.objects.get(elective_type_name = pk)
            new_name = request.data.get('elective_type_name')

            if new_name:
                elective_type.elective_type_name = new_name
            elective_type.save()
            return Response({"status": "success"})

        except ElectiveType.DoesNotExist:
            return Response({"status": "error"}, status=404)
        except Exception as e:
            return Response({"status": "error", "error": str(e)}, status=400)
    

    @action(detail=True, methods=['patch'], url_path='track')
    def update_track(self, request, pk=None):
        try:
            track = Track.objects.get(id=pk)
            name = request.data.get('name')
            program = request.data.get('program')

            if name:
                track.name = name
            if program:
                program_obj = Program.objects.get(id=program)
                track.program = program_obj
            track.save()
            return Response({"status": "success"})
        
        except Track.DoesNotExist:
            return Response({"status": "error"}, status=404)
        except Program.DoesNotExist:
            return Response({"status": "error", "error": "Program not found"}, status=404)
        except Exception as e:
            return Response({"status": "error", "error": str(e)}, status=400)
        
    
    # DELETE command
    @action(detail=True, methods=['delete'], url_path='program')
    def delete_program(self, request, pk=None):
        try:
            program = Program.objects.get(id=pk)
            program.delete()
            return Response({"status": "success"})
        except Program.DoesNotExist:
            return Response({"status": "error"}, status=404)
    

    @action(detail=True, methods=['delete'], url_path='track')
    def delete_track(self, request, pk=None):
        try:
            track = Track.objects.get(id=pk)
            track.delete()
            return Response({"status": "success"})
        except Track.DoesNotExist:
            return Response({"status": "error"}, status=404)
    

    @action(detail=True, methods=['delete'], url_path='elective_type')
    def delete_elective_type(self, request, pk=None):
        try:
            elective_type = ElectiveType.objects.get(elective_type_name = pk)
            elective_type.delete()
            return Response({"status": "success"})
        except ElectiveType.DoesNotExist:
            return Response({"status": "error"}, status=404)
    

    # GET command
    @action(detail=False, methods=['get'], url_path='program')
    def get_programs(self, request):
        programs = Program.objects.all().values('id', 'name', 'language_id')

        return Response({
            "status": "success",
            "programs": list(programs)
        })
    
    @action(detail=False, methods=['get'], url_path='track')
    def get_tracks(self, request):
        tracks = Track.objects.all().values('id', 'name', 'program_id')

        return Response({
            "status": "success",
            "tracks": list(tracks)
        })
    
    @action(detail=False, methods=['get'], url_path='elective_type')
    def get_elective_types(self, request):
        elective_types = ElectiveType.objects.all().values('elective_type_name')

        return Response({
            "status": "success",
            "elective_types": list(elective_types)
        })
    
    @action(detail=False, methods=['get'], url_path='types_by_language')
    def get_types_by_language(self, request):
        data = (
            Elective.objects
            .filter(elective_type__isnull=False)
            .values('program_language')
            .annotate(count=Count('elective_type', distinct=True))
        )

        result = [
            {
                'language' : item['program_language'],
                'count' : item['count']
            }
            for item in data
        ]
        return Response({
            "status": "success",
            "types_by_language": result
        })