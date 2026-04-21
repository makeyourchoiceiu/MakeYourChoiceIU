from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import ElectiveViewSet, ProgramViewSet, TrackViewSet, ElectiveTypeViewSet, settings

router = DefaultRouter()

router.register('electives', ElectiveViewSet)
router.register('programs', ProgramViewSet)
router.register('tracks', TrackViewSet)
router.register('elective_types', ElectiveTypeViewSet)

urlpatterns = router.urls + [
    path('settings/', settings),
]