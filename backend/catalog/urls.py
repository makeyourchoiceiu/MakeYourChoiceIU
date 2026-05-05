from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import ElectiveViewSet, ProgramViewSet, TrackViewSet, ElectiveTypeViewSet, settings, ExceptionsView

router = DefaultRouter()

router.register('electives', ElectiveViewSet)
router.register('programs', ProgramViewSet)
router.register('tracks', TrackViewSet)
router.register('elective_types', ElectiveTypeViewSet)

urlpatterns = router.urls + [
    path('settings/', settings),
    path('exceptions', ExceptionsView.as_view(), name='exceptions'), #for GET und POST
    path('exceptions/<int:pk>', ExceptionsView.as_view(), name='exception-detail'),  #for PATCH und DELETE
]