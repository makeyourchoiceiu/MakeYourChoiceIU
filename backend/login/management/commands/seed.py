from django.core.management.base import BaseCommand
from catalog.models import ProgramLanguage, Degree, ElectiveType, Program, Track, Elective
from iteration.models import Stream, Iteration, StreamElectiveRelation
from login.models import Admin, Student
from django.utils import timezone
from datetime import timedelta


class Command(BaseCommand):
    help = 'Populate the database with mock data for local development'

    def handle(self, *args, **options):
        self.stdout.write('Seeding mock data...')

        # --- Reference data ---
        en, _ = ProgramLanguage.objects.get_or_create(language='EN')
        ru, _ = ProgramLanguage.objects.get_or_create(language='RU')

        m1, _ = Degree.objects.get_or_create(degree_year='M1')
        m2, _ = Degree.objects.get_or_create(degree_year='M2')

        core, _ = ElectiveType.objects.get_or_create(elective_type_name='Core')
        optional, _ = ElectiveType.objects.get_or_create(elective_type_name='Optional')

        # --- Programs & tracks ---
        se_prog, _ = Program.objects.get_or_create(name='Software Engineering', language=en)
        ds_prog, _ = Program.objects.get_or_create(name='Data Science', language=en)

        se_track, _ = Track.objects.get_or_create(name='SE', program=se_prog)
        ds_track, _ = Track.objects.get_or_create(name='DS', program=ds_prog)

        # --- Electives ---
        e1, _ = Elective.objects.get_or_create(
            name='Advanced Algorithms',
            defaults=dict(
                instructor='Prof. Smith',
                description='Deep dive into algorithm design and complexity analysis.',
                elective_language='English',
                format='offline',
                status=1,
                elective_type=core,
                program_language=en,
            ),
        )
        e2, _ = Elective.objects.get_or_create(
            name='Machine Learning',
            defaults=dict(
                instructor='Prof. Johnson',
                description='Supervised and unsupervised learning, neural networks.',
                elective_language='English',
                format='online',
                status=1,
                elective_type=core,
                program_language=en,
            ),
        )
        e3, _ = Elective.objects.get_or_create(
            name='Distributed Systems',
            defaults=dict(
                instructor='Prof. Lee',
                description='CAP theorem, consensus algorithms, distributed storage.',
                elective_language='English',
                format='offline',
                status=1,
                elective_type=optional,
                program_language=en,
            ),
        )

        # --- Stream ---
        stream, _ = Stream.objects.get_or_create(
            degree_year=m1,
            program_lang=en,
            elective_type=core,
            defaults=dict(priorities=3),
        )
        stream.programs.set([se_prog, ds_prog])

        for elective in [e1, e2, e3]:
            StreamElectiveRelation.objects.get_or_create(
                stream_id=stream, elective_id=elective,
            )

        # --- Iteration ---
        iteration, _ = Iteration.objects.get_or_create(
            year=2025,
            season='Spring',
            defaults=dict(deadline=timezone.now() + timedelta(days=30)),
        )
        iteration.streams.set([stream])

        # --- Users ---
        Admin.objects.get_or_create(mail='admin.mock@iu.local', defaults=dict(role=0))
        Admin.objects.get_or_create(mail='admin.student.mock@iu.local', defaults=dict(role=1))

        student, _ = Student.objects.get_or_create(
            mail='student.mock@iu.local',
            defaults=dict(
                degree_year=m1,
                program=se_prog,
                track=se_track,
            ),
        )

        self.stdout.write(self.style.SUCCESS('Done. Mock users:'))
        self.stdout.write('  admin        → admin.mock@iu.local')
        self.stdout.write('  admin+student → admin.student.mock@iu.local')
        self.stdout.write('  student      → student.mock@iu.local')
