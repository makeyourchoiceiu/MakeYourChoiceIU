import uuid
from django.test import TestCase
from rest_framework.test import APIClient

from login.models import Admin
from catalog.models import Degree, Program, ProgramLanguage
from .models import Suggestion


SUGGESTION_DATA = {
    'name': 'Introduction to Quantum Computing',
    'instructor': 'Alice Ivanova',
    'description': 'A course on the fundamentals of quantum computing',
    'elective_language': 'english',
    'format': 'online',
    'prerequisite': 'Linear Algebra',
    'contact': 'alice@example.com',
}


class SuggestionTestBase(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.admin = Admin.objects.create(mail='admin@innopolis.ru', role=0)

        self.pending = Suggestion.objects.create(**SUGGESTION_DATA, status='pending')
        self.rejected = Suggestion.objects.create(**SUGGESTION_DATA, status='rejected')
        self.approved = Suggestion.objects.create(**SUGGESTION_DATA, status='approved')

    def admin_headers(self):
        return {'HTTP_X_USER_EMAIL': self.admin.mail}


# ─── POST /suggestions ────────────────────────────────────────────────────────

class SubmitSuggestionTest(SuggestionTestBase):

    def test_submit_creates_pending_suggestion(self):
        response = self.client.post('/api/suggestions', SUGGESTION_DATA, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['status'], 'success')
        self.assertTrue(Suggestion.objects.filter(name=SUGGESTION_DATA['name'], status='pending').exists())

    def test_submit_missing_required_field_returns_400(self):
        data = {**SUGGESTION_DATA}
        del data['contact']
        response = self.client.post('/api/suggestions', data, format='json')
        self.assertEqual(response.status_code, 400)

    def test_submit_invalid_format_returns_400(self):
        data = {**SUGGESTION_DATA, 'format': 'hybrid'}
        response = self.client.post('/api/suggestions', data, format='json')
        self.assertEqual(response.status_code, 400)

    def test_submit_without_prerequisite_is_ok(self):
        data = {k: v for k, v in SUGGESTION_DATA.items() if k != 'prerequisite'}
        response = self.client.post('/api/suggestions', data, format='json')
        self.assertEqual(response.status_code, 201)


# ─── GET /suggestions ─────────────────────────────────────────────────────────

class ListSuggestionsTest(SuggestionTestBase):

    def test_admin_gets_all_suggestions(self):
        response = self.client.get('/api/suggestions', **self.admin_headers())
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 3)

    def test_response_contains_edit_token(self):
        response = self.client.get('/api/suggestions', **self.admin_headers())
        self.assertEqual(response.status_code, 200)
        for item in response.data:
            self.assertIn('edit_token', item)
            self.assertIsNotNone(item['edit_token'])

    def test_filter_by_pending(self):
        response = self.client.get('/api/suggestions?status=pending', **self.admin_headers())
        self.assertEqual(response.status_code, 200)
        self.assertTrue(all(s['status'] == 'pending' for s in response.data))

    def test_filter_by_rejected(self):
        response = self.client.get('/api/suggestions?status=rejected', **self.admin_headers())
        self.assertEqual(response.status_code, 200)
        self.assertTrue(all(s['status'] == 'rejected' for s in response.data))

    def test_filter_by_approved(self):
        response = self.client.get('/api/suggestions?status=approved', **self.admin_headers())
        self.assertEqual(response.status_code, 200)
        self.assertTrue(all(s['status'] == 'approved' for s in response.data))

    def test_invalid_status_filter_returns_400(self):
        response = self.client.get('/api/suggestions?status=unknown', **self.admin_headers())
        self.assertEqual(response.status_code, 400)

    def test_no_header_returns_403(self):
        response = self.client.get('/api/suggestions')
        self.assertEqual(response.status_code, 403)

    def test_non_admin_email_returns_403(self):
        response = self.client.get('/api/suggestions', HTTP_X_USER_EMAIL='student@innopolis.ru')
        self.assertEqual(response.status_code, 403)


# ─── POST /suggestions/{id}/approve ──────────────────────────────────────────

class ApproveSuggestionTest(SuggestionTestBase):

    def test_approve_pending_creates_elective(self):
        response = self.client.post(
            f'/api/suggestions/{self.pending.id}/approve',
            **self.admin_headers()
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['status'], 'success')
        self.assertIn('elective_id', response.data)

        self.pending.refresh_from_db()
        self.assertEqual(self.pending.status, 'approved')
        self.assertIsNotNone(self.pending.elective)

    def test_approve_sets_elective_status_to_draft(self):
        self.client.post(f'/api/suggestions/{self.pending.id}/approve', **self.admin_headers())
        self.pending.refresh_from_db()
        self.assertEqual(self.pending.elective.status, 0)

    def test_approve_elective_inherits_suggestion_fields(self):
        self.client.post(f'/api/suggestions/{self.pending.id}/approve', **self.admin_headers())
        self.pending.refresh_from_db()
        elective = self.pending.elective
        self.assertEqual(elective.name, self.pending.name)
        self.assertEqual(elective.instructor, self.pending.instructor)
        self.assertEqual(elective.format, self.pending.format)

    def test_approve_rejected_suggestion_works(self):
        response = self.client.post(
            f'/api/suggestions/{self.rejected.id}/approve',
            **self.admin_headers()
        )
        self.assertEqual(response.status_code, 200)

    def test_approve_already_approved_returns_400(self):
        response = self.client.post(
            f'/api/suggestions/{self.approved.id}/approve',
            **self.admin_headers()
        )
        self.assertEqual(response.status_code, 400)

    def test_approve_not_found_returns_404(self):
        response = self.client.post('/api/suggestions/99999/approve', **self.admin_headers())
        self.assertEqual(response.status_code, 404)

    def test_approve_no_auth_returns_403(self):
        response = self.client.post(f'/api/suggestions/{self.pending.id}/approve')
        self.assertEqual(response.status_code, 403)


# ─── POST /suggestions/{id}/reject ───────────────────────────────────────────

class RejectSuggestionTest(SuggestionTestBase):

    def test_reject_pending_suggestion(self):
        response = self.client.post(
            f'/api/suggestions/{self.pending.id}/reject',
            **self.admin_headers()
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['status'], 'success')

        self.pending.refresh_from_db()
        self.assertEqual(self.pending.status, 'rejected')

    def test_reject_does_not_return_edit_link(self):
        response = self.client.post(
            f'/api/suggestions/{self.pending.id}/reject',
            **self.admin_headers()
        )
        self.assertNotIn('edit_link', response.data)

    def test_reject_already_approved_returns_400(self):
        response = self.client.post(
            f'/api/suggestions/{self.approved.id}/reject',
            **self.admin_headers()
        )
        self.assertEqual(response.status_code, 400)

    def test_reject_not_found_returns_404(self):
        response = self.client.post('/api/suggestions/99999/reject', **self.admin_headers())
        self.assertEqual(response.status_code, 404)

    def test_reject_no_auth_returns_403(self):
        response = self.client.post(f'/api/suggestions/{self.pending.id}/reject')
        self.assertEqual(response.status_code, 403)


# ─── GET /suggestions/{id}/edit-link ─────────────────────────────────────────

class EditLinkTest(SuggestionTestBase):

    def test_admin_gets_edit_link(self):
        response = self.client.get(
            f'/api/suggestions/{self.pending.id}/edit-link',
            **self.admin_headers()
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('edit_link', response.data)
        self.assertIn(str(self.pending.edit_token), response.data['edit_link'])

    def test_edit_link_contains_token(self):
        response = self.client.get(
            f'/api/suggestions/{self.rejected.id}/edit-link',
            **self.admin_headers()
        )
        self.assertIn(str(self.rejected.edit_token), response.data['edit_link'])

    def test_not_found_returns_404(self):
        response = self.client.get('/api/suggestions/99999/edit-link', **self.admin_headers())
        self.assertEqual(response.status_code, 404)

    def test_no_auth_returns_403(self):
        response = self.client.get(f'/api/suggestions/{self.pending.id}/edit-link')
        self.assertEqual(response.status_code, 403)


# ─── GET /suggestions/edit/{token} ───────────────────────────────────────────

class GetByTokenTest(SuggestionTestBase):

    def test_get_pending_suggestion_by_token(self):
        response = self.client.get(f'/api/suggestions/edit/{self.pending.edit_token}')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['name'], self.pending.name)

    def test_get_rejected_suggestion_by_token(self):
        response = self.client.get(f'/api/suggestions/edit/{self.rejected.edit_token}')
        self.assertEqual(response.status_code, 200)

    def test_get_approved_suggestion_returns_400(self):
        response = self.client.get(f'/api/suggestions/edit/{self.approved.edit_token}')
        self.assertEqual(response.status_code, 400)

    def test_invalid_token_returns_404(self):
        response = self.client.get(f'/api/suggestions/edit/{uuid.uuid4()}')
        self.assertEqual(response.status_code, 404)


# ─── PATCH /suggestions/edit/{token} ─────────────────────────────────────────

class EditByTokenTest(SuggestionTestBase):

    def test_edit_pending_suggestion(self):
        response = self.client.patch(
            f'/api/suggestions/edit/{self.pending.edit_token}',
            {'name': 'Updated Name'},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.pending.refresh_from_db()
        self.assertEqual(self.pending.name, 'Updated Name')

    def test_edit_resets_status_to_pending(self):
        response = self.client.patch(
            f'/api/suggestions/edit/{self.rejected.edit_token}',
            {'name': 'Fixed Name'},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.rejected.refresh_from_db()
        self.assertEqual(self.rejected.status, 'pending')

    def test_edit_invalid_format_returns_400(self):
        response = self.client.patch(
            f'/api/suggestions/edit/{self.pending.edit_token}',
            {'format': 'hybrid'},
            format='json'
        )
        self.assertEqual(response.status_code, 400)

    def test_edit_approved_suggestion_returns_400(self):
        response = self.client.patch(
            f'/api/suggestions/edit/{self.approved.edit_token}',
            {'name': 'Attempt'},
            format='json'
        )
        self.assertEqual(response.status_code, 400)

    def test_invalid_token_returns_404(self):
        response = self.client.patch(
            f'/api/suggestions/edit/{uuid.uuid4()}',
            {'name': 'Ghost'},
            format='json'
        )
        self.assertEqual(response.status_code, 404)
