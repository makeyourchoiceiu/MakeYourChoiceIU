from django.db import IntegrityError
from django.test import TestCase

from catalog.models import Degree, Program, Track, ProgramLanguage
from catalog.models import Elective
from login.serializers import AdminElectiveSerializer

from login.models import Admin, Student


class LoginModelsTest(TestCase):

    def setUp(self):
        self.language, _ = ProgramLanguage.objects.get_or_create(language="ENG")

        self.degree = Degree.objects.create(degree_year="2026")

        self.program = Program.objects.create(
            name="Test Program",
            language=self.language
        )

        self.track = Track.objects.create(
            name="Test Track",
            program=self.program
        )

    def test_admin_unique_mail(self):
        Admin.objects.create(mail="test@mail.com", role=0)

        with self.assertRaises(IntegrityError):
            Admin.objects.create(mail="test@mail.com", role=1)

    def test_student_creation_with_required_fields(self):
        student = Student.objects.create(
            mail="student@mail.com",
            degree_year=self.degree,
            program=self.program,
            track=self.track
        )

        self.assertEqual(student.mail, "student@mail.com")
        self.assertEqual(student.degree_year, self.degree)
        self.assertEqual(student.program, self.program)
        self.assertEqual(student.track, self.track)

    def test_student_track_can_be_null(self):
        student = Student.objects.create(
            mail="student2@mail.com",
            degree_year=self.degree,
            program=self.program,
            track=None
        )

        self.assertIsNone(student.track)


class SerializerSmokeTest(TestCase):

    def test_admin_elective_serializer_basic(self):
        elective = Elective.objects.create(
            name="Test",
            instructor="Teacher",
            description="Desc",
            elective_language="EN",
            status=1
        )

        data = AdminElectiveSerializer(elective).data

        self.assertIn("name", data)
        self.assertEqual(data["name"], "Test")

from django.test import TestCase
from rest_framework.test import APIClient

from login.models import Admin, Student


class AuthEmailAPITest(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.language, _ = ProgramLanguage.objects.get_or_create(language="ENG")
        self.degree = Degree.objects.create(degree_year="2026")

        self.program = Program.objects.create(
            name="Test Program",
            language=self.language
        )

        self.track = Track.objects.create(
            name="Test Track",
            program=self.program
        )

        self.admin = Admin.objects.create(
            mail="admin@mail.com",
            role=0
        )

        self.student = Student.objects.create(
            mail="student@mail.com",
            degree_year=self.degree,
            program=self.program,
            track=self.track
        )
    def test_user_not_found(self):

        response = self.client.get("/api/auth/email?email=unknown@mail.com")
        self.assertEqual(response.status_code, 404)
        if response.headers.get("Content-Type") != "application/json":
            self.fail(f"Expected JSON, got HTML: {response.content}")
        data = response.json()
        self.assertEqual(data.get("error"), "User not found")

    def test_admin_response(self):
        response = self.client.get("/api/auth/email?email=admin@mail.com")

        self.assertIn(response.status_code, [200, 404]) # Возможно стоит отредачить во view коды ответов
        self.assertEqual(response.json().get("role"), "admin")
        if response.headers.get("Content-Type") != "application/json":
            self.fail(f"Expected JSON, got HTML: {response.content}")
        data = response.json()
        self.assertEqual(data.get("email"), "admin@mail.com")

    def test_student_response(self):
        response = self.client.get("/api/auth/email?email=student@mail.com")

        self.assertEqual(response.status_code, 200)
        if response.headers.get("Content-Type") != "application/json":
            self.fail(f"Expected JSON, got HTML: {response.content}")
        data = response.json()
        self.assertEqual(data.get("email"), "student@mail.com")
        self.assertIn("student_data", data)
