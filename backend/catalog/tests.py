from django.db import IntegrityError
from django.test import TestCase
from rest_framework.test import APITestCase

from catalog.models import (
    Degree,
    Elective,
    ElectiveType,
    Program,
    ProgramLanguage,
    Track,
)
from catalog.models import ElectiveTrackException

from catalog.serializers import (
    ElectiveSerializer,
    ProgramSerializer,
    TrackSerializer,
    ElectiveTrackExceptionSerializer,
)


class BaseCatalogTestCase(TestCase):
    def setUp(self):
        self.language, _ = ProgramLanguage.objects.get_or_create(language="ENG")

        self.degree = Degree.objects.create(degree_year="2025")

        self.elective_type = ElectiveType.objects.create(
            elective_type_name="Technical"
        )

        self.elective = Elective.objects.create(
            name="Python Basics",
            instructor="John Doe",
            description="Intro course",
            elective_type=self.elective_type,
            program_language=self.language,
            elective_language="English",
            format="online",
        )

        self.program = Program.objects.create(
            name="Computer Science",
            language=self.language
        )

        self.track = Track.objects.create(
            name="SE",
            program=self.program
        )


class ModelsTestCase(BaseCatalogTestCase):

    def test_str_models(self):
        self.assertEqual(str(self.elective), "Python Basics")
        self.assertEqual(str(self.track), "SE")

    def test_m2m_degree(self):
        self.elective.degree_year.add(self.degree)
        self.assertIn(self.degree, self.elective.degree_year.all())

    def test_track_exception_unique(self):
        ElectiveTrackException.objects.create(
            elective=self.elective,
            track=self.track
        )

        with self.assertRaises(IntegrityError):
            ElectiveTrackException.objects.create(
                elective=self.elective,
                track=self.track
            )


class SerializersTestCase(BaseCatalogTestCase):

    def test_elective_serializer_smoke(self):
        data = ElectiveSerializer(self.elective).data
        self.assertEqual(data["name"], "Python Basics")

    def test_program_serializer_create(self):
        serializer = ProgramSerializer(data={
            "name": "Data Science",
            "language": self.language.language,
        })

        self.assertTrue(serializer.is_valid(), serializer.errors)
        obj = serializer.save()
        self.assertEqual(obj.name, "Data Science")

    def test_track_serializer_create(self):
        serializer = TrackSerializer(data={
            "name": "AI",
            "program": self.program.id,
        })

        self.assertTrue(serializer.is_valid(), serializer.errors)
        obj = serializer.save()
        self.assertEqual(obj.name, "AI")

    def test_exception_serializer_create(self):
        serializer = ElectiveTrackExceptionSerializer(data={
            "elective_id": self.elective.id,
            "track_id": self.track.id,
        })

        self.assertTrue(serializer.is_valid(), serializer.errors)
        obj = serializer.save()

        self.assertEqual(obj.elective, self.elective)
        self.assertEqual(obj.track, self.track)

class BaseAPITestCase(APITestCase):
    def setUp(self):
        self.language, _ = ProgramLanguage.objects.get_or_create(language="ENG")

        self.degree = Degree.objects.create(degree_year="2025")

        self.elective_type = ElectiveType.objects.create(
            elective_type_name="Technical"
        )

        self.elective = Elective.objects.create(
            name="Python Basics",
            instructor="John Doe",
            description="Intro course",
            elective_type=self.elective_type,
            program_language=self.language,
            elective_language="English",
            format="online",
            status=1,
        )

        self.program = Program.objects.create(
            name="Computer Science",
            language=self.language
        )

        self.track = Track.objects.create(
            name="SE",
            program=self.program
        )


class ElectiveAPITest(BaseAPITestCase):

    def test_create_elective(self):
        res = self.client.post("/api/electives/", {
            "name": "New Course",
            "instructor": "Jane",
            "description": "Test",
            "elective_type": self.elective_type.elective_type_name,
            "program_language": self.language.language,
            "elective_language": "English",
            "format": "online",
        })

        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.data["status"], "success")

    def test_archive_elective(self):
        res = self.client.post(f"/api/electives/{self.elective.id}/archive/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["status"], "archived")


class ProgramAPITest(BaseAPITestCase):

    def test_create_program(self):
        res = self.client.post("/api/programs/", {
            "name": "AI",
            "language": self.language.language,
        })

        self.assertEqual(res.status_code, 201)

    def test_delete_program(self):
        res = self.client.delete(f"/api/programs/{self.program.id}/")
        self.assertEqual(res.status_code, 200)


class TrackAPITest(BaseAPITestCase):

    def test_create_track(self):
        res = self.client.post("/api/tracks/", {
            "name": "AI",
            "program": self.program.id,
        })

        self.assertEqual(res.status_code, 201)

    def test_delete_track(self):
        res = self.client.delete(f"/api/tracks/{self.track.id}/")
        self.assertEqual(res.status_code, 200)


class ElectiveTypeAPITest(BaseAPITestCase):

    def test_create_type(self):
        res = self.client.post("/api/elective_types/", {
            "elective_type_name": "Core"
        })

        self.assertEqual(res.status_code, 201)


class ExceptionsAPITest(BaseAPITestCase):

    def test_create_exception(self):
        res = self.client.post("/api/exceptions", {
            "elective_id": self.elective.id,
            "track_id": self.track.id,
        })

        self.assertEqual(res.status_code, 201)

    def test_delete_exception(self):
        exc = ElectiveTrackException.objects.create(
            elective=self.elective,
            track=self.track
        )

        res = self.client.delete(f"/api/exceptions/{exc.id}")
        self.assertEqual(res.status_code, 200)