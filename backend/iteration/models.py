from django.db import models
from catalog import models as catalog_models

class Stream(models.Model):
    id = models.BigAutoField(primary_key=True)
    degree_year = models.ForeignKey(catalog_models.Degree, on_delete=models.CASCADE)
    program_lang = models.ForeignKey(catalog_models.ProgramLanguage, on_delete=models.RESTRICT)
    elective_type = models.ForeignKey(catalog_models.ElectiveType, on_delete=models.CASCADE)
    programs = models.ManyToManyField(catalog_models.Program)
    priorities = models.IntegerField(default=5)

class Iteration(models.Model):
    id = models.BigAutoField(primary_key=True)
    year = models.IntegerField()
    season = models.CharField(max_length=6)
    streams = models.ManyToManyField(Stream)
    deadline = models.DateTimeField()

class StreamElectiveRelation(models.Model):
    stream_id = models.ForeignKey(Stream, on_delete=models.CASCADE)
    elective_id = models.ForeignKey(catalog_models.Elective, on_delete=models.CASCADE)

# class IterationStreamRelation(models.Model):  # kept if explicit relation table is needed later
#     iteration_id = models.ForeignKey(Iteration, on_delete=models.CASCADE)
#     stream_id = models.ForeignKey(Stream, on_delete=models.CASCADE)