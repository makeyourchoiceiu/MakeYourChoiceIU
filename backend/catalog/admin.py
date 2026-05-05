from django.contrib import admin
from .models import ProgramLanguage, Degree, ElectiveType, Elective, Program, Track, ElectiveTrackException

@admin.register(ProgramLanguage)
class LanguageAdmin(admin.ModelAdmin):
    list_display = ('language',)
    search_fields = ('language',)

@admin.register(Degree)
class DegreeAdmin(admin.ModelAdmin):
    list_display = ('degree_year',)
    search_fields = ('degree_year',)

@admin.register(ElectiveType)
class ElectiveTypesAdmin(admin.ModelAdmin):
    list_display = ('elective_type_name',)
    search_fields = ('elective_type_name',)

@admin.register(Program)
class ProgramsAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'language',)
    search_fields = ('name',)

@admin.register(Elective)
class ElectivesAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'instructor', 'elective_type', 'program_language', 'elective_language', 'status',)
    search_fields = ('name', 'instructor',)
    filter_horizontal = ('degree_year',)  # для ManyToManyField удобный виджет

    def degrees(self, obj):
        return ", ".join([degree.degree_year for degree in obj.degree_year.all()])

@admin.register(Track)
class TracksAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'program',)
    list_filter = ('program',)
    search_fields = ('name',)

@admin.register(ElectiveTrackException)
class ElectiveTrackExceptionsAdmin(admin.ModelAdmin):
    list_display = ('id', 'elective', 'track', 'created_at',)
    list_filter = ('created_at', 'elective',)
    search_fields = ('elective__name', 'track__name',)
