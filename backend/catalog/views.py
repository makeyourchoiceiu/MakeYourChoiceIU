from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import ProgramLanguages, Degree, ElectiveTypes, Electives, Programs, Tracks
from .serializers import CourseSerializer

# class ElectiveForAdmin(APIView):
#     electives = Electives.objects.all()

#     serializer = ElectiveSerializer()

