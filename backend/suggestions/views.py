from rest_framework.views import APIView
from rest_framework.response import Response

from login.models import Admin
from catalog.models import Elective
from .models import Suggestion
from .serializers import SuggestionCreateSerializer, SuggestionSerializer


def get_admin(request):
    """Return Admin instance if X-User-Email header belongs to an admin, else None."""
    email = request.headers.get('X-User-Email')
    if not email:
        return None
    return Admin.objects.filter(mail=email).first()


class SuggestionListView(APIView):

    def post(self, request):
        """POST /suggestions — submit a course suggestion (no auth required)."""
        serializer = SuggestionCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'status': 'error', 'errors': serializer.errors}, status=400)

        serializer.save()
        return Response(
            {'status': 'success', 'message': 'Your suggestion has been submitted and is pending review'},
            status=201
        )

    def get(self, request):
        """GET /suggestions — list all suggestions, optionally filtered by status (admin only)."""
        if not get_admin(request):
            return Response({'status': 'error', 'message': 'Forbidden'}, status=403)

        status_filter = request.query_params.get('status')
        queryset = Suggestion.objects.all().order_by('-created_at')

        if status_filter:
            if status_filter not in ('pending', 'approved', 'rejected'):
                return Response({'status': 'error', 'message': 'Invalid status value'}, status=400)
            queryset = queryset.filter(status=status_filter)

        serializer = SuggestionSerializer(
            queryset, many=True, context={'request': request, 'is_admin': True}
        )
        return Response(serializer.data)


class SuggestionApproveView(APIView):

    def post(self, request, pk):
        """POST /suggestions/{id}/approve — approve a suggestion and create a draft elective (admin only)."""
        if not get_admin(request):
            return Response({'status': 'error', 'message': 'Forbidden'}, status=403)

        try:
            suggestion = Suggestion.objects.get(pk=pk)
        except Suggestion.DoesNotExist:
            return Response({'status': 'error', 'message': 'Suggestion not found'}, status=404)

        if suggestion.status == 'approved':
            return Response({'status': 'error', 'message': 'Suggestion is already approved'}, status=400)

        # Create a draft elective (status=0) from the suggestion data.
        # program_language and elective_type are left null — admin fills them later via PATCH /electives/{id}.
        elective = Elective.objects.create(
            name=suggestion.name,
            instructor=suggestion.instructor,
            description=suggestion.description,
            elective_language=suggestion.elective_language,
            format=suggestion.format,
            prerequisite=suggestion.prerequisite,
            status=0,
        )

        suggestion.status = 'approved'
        suggestion.elective = elective
        suggestion.save()

        return Response({
            'status': 'success',
            'message': 'Suggestion approved',
            'elective_id': elective.id,
        })


class SuggestionRejectView(APIView):

    def post(self, request, pk):
        """POST /suggestions/{id}/reject — reject a suggestion and return an edit link (admin only)."""
        if not get_admin(request):
            return Response({'status': 'error', 'message': 'Forbidden'}, status=403)

        try:
            suggestion = Suggestion.objects.get(pk=pk)
        except Suggestion.DoesNotExist:
            return Response({'status': 'error', 'message': 'Suggestion not found'}, status=404)

        if suggestion.status == 'approved':
            return Response({'status': 'error', 'message': 'Cannot reject an already approved suggestion'}, status=400)

        suggestion.status = 'rejected'
        suggestion.save()

        frontend_base = 'http://localhost:3000'  # TODO: move to settings
        edit_link = f'{frontend_base}/suggestions/edit/{suggestion.edit_token}'

        return Response({
            'status': 'success',
            'message': 'Suggestion rejected',
            'edit_link': edit_link,
        })


class SuggestionEditView(APIView):

    def _get_editable_suggestion(self, token):
        """Return suggestion by edit_token if it is in an editable state (pending or rejected)."""
        try:
            suggestion = Suggestion.objects.get(edit_token=token)
        except Suggestion.DoesNotExist:
            return None, Response({'status': 'error', 'message': 'Suggestion not found'}, status=404)

        if suggestion.status == 'approved':
            return None, Response(
                {'status': 'error', 'message': 'Approved suggestions cannot be edited'},
                status=400
            )

        return suggestion, None

    def get(self, request, token):
        """GET /suggestions/edit/{token} — retrieve suggestion by edit token (no auth required)."""
        suggestion, error = self._get_editable_suggestion(token)
        if error:
            return error

        serializer = SuggestionSerializer(suggestion, context={'request': request, 'is_admin': False})
        return Response(serializer.data)

    def patch(self, request, token):
        """PATCH /suggestions/edit/{token} — update suggestion by edit token, resets status to pending."""
        suggestion, error = self._get_editable_suggestion(token)
        if error:
            return error

        serializer = SuggestionCreateSerializer(suggestion, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({'status': 'error', 'errors': serializer.errors}, status=400)

        serializer.save(status='pending')
        return Response({'status': 'success', 'message': 'Suggestion updated'})
