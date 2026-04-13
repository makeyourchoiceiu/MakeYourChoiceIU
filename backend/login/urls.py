from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import auth_email

urlpatterns = [
    path("auth/email", auth_email),
]