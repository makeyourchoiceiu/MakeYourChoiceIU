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
    FORMAT_CHOICES = [('online', 'online'), ('offline', 'offline')]

    elective_type = models.ForeignKey(ElectiveType, null=True, on_delete=models.RESTRICT)
    program_language = models.ForeignKey(ProgramLanguage, null=True, blank=True, on_delete=models.CASCADE)
    elective_language = models.CharField(max_length=20)
    format = models.CharField(max_length=10, choices=FORMAT_CHOICES, blank=True, default='')
    status = models.IntegerField(default=0)  # 0 - draft, 1 - active, 2 - completed, -1 - deleted
    degree_year = models.ManyToManyField(Degree, blank=True)
    prerequisite = models.TextField(blank=True)

    def __str__(self):
        return self.name

class Program(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=200)
    language = models.ForeignKey(ProgramLanguage, on_delete=models.CASCADE)

class Track(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=10)
    program = models.ForeignKey(Program, on_delete=models.CASCADE) # if a program is deleted, track is deleted, too

    def __str__(self):
        return self.name

class ElectiveTrackException(models.Model):
    elective = models.ForeignKey('Elective', on_delete=models.CASCADE)
    track = models.ForeignKey('Track', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [['elective', 'track']]  # to avoid duplicates
        db_table = 'catalog_elective_track_exception'