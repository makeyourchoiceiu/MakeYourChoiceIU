from rest_framework.routers import DefaultRouter
from .views import ElectiveViewSet, ProgramViewSet

router = DefaultRouter()

router.register('electives', ElectiveViewSet)
router.register('program', ProgramViewSet)

urlpatterns = router.urls