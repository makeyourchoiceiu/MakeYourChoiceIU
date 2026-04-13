from django.contrib import admin

from .models import Stream, Iteration, StreamElectiveRelation

@admin.register(Stream)
class StreamAdmin(admin.ModelAdmin):
    list_display = ('id', 'degree_year', 'program_lang', 'elective_type', 'priorities',)
    search_fields = ('degree_year', 'program_lang', 'elective_type', 'programs', 'priorities',)
    filter_horizontal = ('programs',)

    def _programs(self, obj):
        return ", ".join([program.programs for program in obj.programs.all()])

@admin.register(Iteration)
class IterationAdmin(admin.ModelAdmin):
    list_display = ('id', 'year', 'season', 'deadline',)
    search_fields = ('year', 'season', 'deadline',)
    filter_horizontal = ('streams',)

    def _streams(self, obj):
        return ", ".join([stream.streams for stream in obj.streams.all()])

@admin.register(StreamElectiveRelation)
class StreamElectiveAdmin(admin.ModelAdmin):
    list_display = ('stream_id', 'elective_id',)
    search_fields = ('stream_id', 'elective_id',)
