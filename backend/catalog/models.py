from django.db import models

class ProgramLanguage(models.Model):
    language = models.CharField(unique=True, primary_key=True, max_length=3)

class Degree(models.Model):
    degree_year = models.CharField(unique=True, primary_key=True, max_length=10)

class ElectiveType(models.Model):
    elective_type_name = models.CharField(max_length=20, unique=True, primary_key=True)

class Elective(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=200)
    instructor = models.CharField(max_length=100)
    description = models.TextField()
    elective_type = models.ForeignKey(ElectiveType, null=True, on_delete=models.RESTRICT)
    program_language = models.ForeignKey(ProgramLanguage, on_delete=models.CASCADE)
    elective_language = models.CharField(max_length=20)
    status = models.IntegerField(default=0) # 0 - , 1 - todo!! чтобы точно все знали расшифровку статусов
    degree_year = models.ManyToManyField(Degree, blank=True)
    prerequisite = models.TextField()

class Program(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=200)
    language = models.ForeignKey(ProgramLanguage, on_delete=models.CASCADE)

class Track(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=10)
    program = models.ForeignKey(Program, on_delete=models.CASCADE) # if a program is deleted, track is deleted, too