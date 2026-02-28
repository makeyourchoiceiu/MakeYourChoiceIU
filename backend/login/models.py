from django.db import models
from catalog import models as catalog_models

class Admin(models.Model):
    id = models.BigAutoField(unique=True, primary_key=True)
    mail = models.CharField(unique=True)
    role = models.IntegerField() #0 - Admin, 1 - Admin-student

class Student(models.Model):
    id = models.BigAutoField(unique=True, primary_key=True)
    mail = models.CharField(unique=True)
    degree_year = models.ForeignKey(catalog_models.Degree, on_delete=models.CASCADE)
    program = models.ForeignKey(catalog_models.Program, on_delete=models.CASCADE)
    track = models.ForeignKey(catalog_models.Track, null=True, on_delete=models.RESTRICT)
# Create your models here.
