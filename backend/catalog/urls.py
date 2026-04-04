from rest_framework.routers import DefaultRouter
from .views import ElectiveViewSet, SettingsViewSet

router = DefaultRouter()

router.register('electives', ElectiveViewSet)
router.register('settings', SettingsViewSet, basename='settings')

urlpatterns = router.urls