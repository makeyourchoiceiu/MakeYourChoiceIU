from django.db import models

class elective_types(models.Model):
    id = models.IntegerField(unique=True, primary_key=True) # set additional row id=0 as default in the table
    name = models.TextField(unique=True)

class electives(models.Model):
    id = models.IntegerField(unique=True, primary_key=True)
    name = models.TextField()
    instructor = models.TextField(max_length=100)
    description = models.TextField()
    elective_type = models.ForeignKey(elective_types, on_delete=models.SET_DEFAULT, default=0)
    language = models.TextField(max_length=3)
    status = models.IntegerField(default=0)
    degree_year = models.TextField(max_length=5)
    prerequisite = models.TextField()

class programs(models.Model):
    id = models.IntegerField(unique=True, primary_key=True)
    name = models.TextField()
    language = models.TextField(max_length=3)

class tracks(models.Model):
    id = models.IntegerField(unique=True, primary_key=True)
    name = models.TextField()
    program_id = models.ForeignKey(programs, on_delete=models.CASCADE) # if a program is deleted, track is deleted, too