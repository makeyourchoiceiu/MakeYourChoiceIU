from django.urls import path
from .views import submit_electives

urlpatterns = [
    path("me/submissions", submit_electives),
]