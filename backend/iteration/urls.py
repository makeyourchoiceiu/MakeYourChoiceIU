from rest_framework.routers import DefaultRouter
from .views import StreamViewSet, SemesterViewSet
from django.urls import path, include

router = DefaultRouter()

router.register('streams', StreamViewSet)
router.register('semesters', SemesterViewSet, basename='semesters')

urlpatterns = [
    path('', include(router.urls)),
]