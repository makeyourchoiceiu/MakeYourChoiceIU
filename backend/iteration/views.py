from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Stream
from .serializers import StreamSerializer
from catalog.models import Elective
from catalog.serializers import ElectiveSerializer


class StreamViewSet(viewsets.ModelViewSet):
    serializer_class = StreamSerializer
    queryset = Elective.objects.all()

    def get_queryset(self):

        semester_id = self.request.query_params.get('semesterId')

        queryset = Stream.objects.all()

        if semester_id:
            queryset = queryset.filter(semester_id=semester_id)

        return queryset


    # GET /streams/{id}/elective
    @action(detail=True,methods=['get'],url_path='elective')
    def get_elective(self, request, pk=None):

        stream = self.get_object()

        elective = stream.elective.all()

        serializer = ElectiveSerializer(elective, many=True)

        return Response(serializer.data)


    # POST /streams/{id}/elective
    @action(detail=True,methods=['post'],url_path='elective')
    def add_elective(self, request, pk=None):
        stream = self.get_object()

        elective_ids = request.data.get('electiveIds', [])

        elective = Elective.objects.filter(id__in=elective_ids)

        stream.elective.add(*elective)

        return Response({"status": "added"})


    # DELETE /streams/{id}/elective/{electiveId}
    @action(detail=True,methods=['delete'],url_path='elective/(?P<elective_id>[^/.]+)')
    def remove_elective(self, request, pk=None, elective_id=None):

        stream = self.get_object()

        stream.elective.remove(elective_id)

        return Response({"status": "removed"})