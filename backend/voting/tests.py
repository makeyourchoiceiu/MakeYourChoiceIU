from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APITestCase

from catalog.models import Degree, ProgramLanguage, Program
from catalog.models import Elective, ElectiveType
from iteration.models import Iteration, Stream, StreamElectiveRelation
from login.models import Student
from voting.models import History
from voting.serializers import SubmissionSerializer


class VotingTestCase(APITestCase, TestCase):

    def setUp(self):
        self.elective_type = ElectiveType.objects.create(elective_type_name="TEST_TYPE")
        self.degree = Degree.objects.create(degree_year="2026")
        self.language, _ = ProgramLanguage.objects.get_or_create(language="ENG")

        self.stream = Stream.objects.create(
            degree_year=self.degree,
            program_lang=self.language,
            elective_type=self.elective_type,
            priorities=5
        )

        self.iteration = Iteration.objects.create(
            year=2026,
            season="spring",
            deadline=timezone.now()
        )
        self.iteration.streams.add(self.stream)

        self.program = Program.objects.create(
            name="CS",
            language=self.language
        )

        self.stream.programs.add(self.program)

        self.student = Student.objects.create(
            mail="test@student.com",
            degree_year=self.degree,
            program=self.program
        )

        self.elective = Elective.objects.create(
            name="Test Elective",
            instructor="Test Instructor",
            description="Test Description",
            elective_type=self.elective_type,
            program_language=self.language,
            elective_language="ENG",
            status=1,
        )

        StreamElectiveRelation.objects.create(
            stream_id=self.stream,
            elective_id=self.elective
        )

        self.url = "/api/me/submissions"

        History.objects.all().delete()

    def test_history_created(self):
        history = History.objects.create(
            iteration=self.iteration,
            student=self.student,
            elective_type=self.elective_type,
            elective=self.elective,
            priority=1,
            date=timezone.now()
        )
        self.assertEqual(History.objects.count(), 1)

    def test_cascade_delete_student(self):
        History.objects.create(
            iteration=self.iteration,
            student=self.student,
            elective_type=self.elective_type,
            elective=self.elective,
            priority=1,
            date=timezone.now()
        )
        self.student.delete()
        self.assertEqual(History.objects.count(), 0)

    def test_valid_submission_serializer(self):
        data = {
            "student_id": self.student.id,
            "iteration_id": self.iteration.id,
            "elective_type": "Core",
            "electives": [
                {"priority": 1, "elective_id": 10},
            ],
        }

        serializer = SubmissionSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_missing_iteration_id_serializer(self):
        data = {
            "student_id": self.student.id,
            "elective_type": "Core",
            "electives": [
                {"priority": 1, "elective_id": 10},
            ],
        }

        serializer = SubmissionSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("iteration_id", serializer.errors)

    def test_success_submission(self):
        payload = {
            "student_id": self.student.id,
            "iteration_id": self.iteration.id,
            "elective_type": "TEST_TYPE",
            "electives": [
                {"priority": 1, "elective_id": self.elective.id},
            ],
        }

        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["status"], "success")

    def test_student_not_found(self):
        payload = {
            "student_id": 999,
            "iteration_id": self.iteration.id,
            "elective_type": "TEST_TYPE",
            "electives": [
                {"priority": 1, "elective_id": self.elective.id},
            ],
        }

        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data["error"], "Student not found")

    def test_duplicate_electives(self):
        payload = {
            "student_id": self.student.id,
            "iteration_id": self.iteration.id,
            "elective_type": "TEST_TYPE",
            "electives": [
                {"priority": 1, "elective_id": self.elective.id},
                {"priority": 2, "elective_id": self.elective.id},
            ],
        }

        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "Duplicate electives")

    def test_inactive_elective(self):
        self.elective.status = 0
        self.elective.save()

        payload = {
            "student_id": self.student.id,
            "iteration_id": self.iteration.id,
            "elective_type": "TEST_TYPE",
            "electives": [
                {"priority": 1, "elective_id": self.elective.id},
            ],
        }

        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "Some electives are not active")
