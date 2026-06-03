from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Stream, StreamElectiveRelation
from .serializers import StreamSerializer
from catalog.models import Elective
from catalog.serializers import ElectiveSerializer


class StreamViewSet(viewsets.ModelViewSet):
    serializer_class = StreamSerializer
    queryset = Stream.objects.all()

    def get_queryset(self):
        return Stream.objects.all()


    # GET/POST /streams/{id}/elective
    @action(detail=True, methods=['get', 'post'], url_path='elective')
    def elective(self, request, pk=None):
        stream = self.get_object()
        if request.method.lower() == 'get':
            elective_ids = StreamElectiveRelation.objects.filter(
                stream_id=stream
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

        return Response({"status": "added"})


    # DELETE /streams/{id}/elective/{electiveId}
    @action(detail=True,methods=['delete'],url_path='elective/(?P<elective_id>[^/.]+)')
    def remove_elective(self, request, pk=None, elective_id=None):
        stream = self.get_object()
        StreamElectiveRelation.objects.filter(
            stream_id=stream,
            elective_id_id=elective_id,
        ).delete()

        return Response({"status": "removed"})
