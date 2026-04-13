from django.db import models
from login import models as login_models
from catalog import models as catalog_models
from iteration import models as iteration_models

class History(models.Model):
    iteration = models.ForeignKey(iteration_models.Iteration, on_delete=models.CASCADE)
    student = models.ForeignKey(login_models.Student, on_delete=models.CASCADE)
    elective_type = models.ForeignKey(catalog_models.ElectiveType, on_delete=models.CASCADE)
    priority = models.IntegerField()
    elective = models.ForeignKey(catalog_models.Elective, on_delete=models.CASCADE)
    date = models.DateTimeField()

    # если вдруг нужен будет ключ, но вроде нет
    # class Meta:
    #     constraints = [
    #         models.UniqueConstraint(
    #             fields=['iteration', 'student', 'elective_type', 'priority'],
    #             name='unique_student_elective_choice'
    #         )
    #     ]
