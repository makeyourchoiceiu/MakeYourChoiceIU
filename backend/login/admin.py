from django.contrib import admin

from .models import Student, Admin

@admin.register(Admin)
class AdminAdmin(admin.ModelAdmin):
    list_display = ('mail', 'role',)
    search_fields = ('mail',)

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('id', 'mail', 'degree_year', 'program',)
    search_fields = ('mail',)
