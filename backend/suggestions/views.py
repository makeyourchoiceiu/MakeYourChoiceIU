from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import serializers as s
from drf_spectacular.utils import extend_schema, OpenApiParameter, inline_serializer
from drf_spectacular.types import OpenApiTypes

from login.models import Admin
from catalog.models import Elective
from .models import Suggestion
from .serializers import SuggestionCreateSerializer, SuggestionSerializer

_forbidden = inline_serializer('Forbidden', fields={
    'status': s.CharField(help_text='"error"'),
    'message': s.CharField(help_text='"Forbidden"'),
})
_not_found = inline_serializer('SuggestionNotFound', fields={
    'status': s.CharField(help_text='"error"'),
    'message': s.CharField(help_text='"Suggestion not found"'),
})


def get_admin(request):
    """Return Admin instance if X-User-Email header belongs to an admin, else None."""
    email = request.headers.get('X-User-Email')
    if not email:
        return None
    return Admin.objects.filter(mail=email).first()


class SuggestionListView(APIView):

    @extend_schema(
        summary='Submit a course suggestion',
        description=(
            'Allows anyone (no authentication required) to submit a new elective suggestion. '
            'The suggestion is created with status `pending` and an auto-generated `edit_token` '
            'that the author can use to edit their submission later.'
        ),
        request=SuggestionCreateSerializer,
        responses={
            201: inline_serializer('SuggestionSubmitResponse', fields={
                'status': s.CharField(help_text='"success"'),
                'message': s.CharField(help_text='Confirmation message'),
            }),
            400: inline_serializer('SuggestionSubmitError', fields={
                'status': s.CharField(help_text='"error"'),
                'errors': s.DictField(help_text='Validation errors keyed by field name'),
            }),
        },
    )
    def post(self, request):
        serializer = SuggestionCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'status': 'error', 'errors': serializer.errors}, status=400)
        serializer.save()
        return Response(
            {'status': 'success', 'message': 'Your suggestion has been submitted and is pending review'},
            status=201,
        )

    @extend_schema(
        summary='List all suggestions (admin)',
        description=(
            'Returns all submitted suggestions, optionally filtered by status. '
            'Requires the `X-User-Email` header to belong to an admin account.\n\n'
            'Each suggestion includes its `edit_token` so admins can share the edit link with authors.'
        ),
        parameters=[
            OpenApiParameter(
                'status', OpenApiTypes.STR,
                description='Filter by review status: "pending", "approved", or "rejected"',
            ),
        ],
        responses={
            200: SuggestionSerializer(many=True),
            400: inline_serializer('InvalidStatusError', fields={
                'status': s.CharField(help_text='"error"'),
                'message': s.CharField(help_text='"Invalid status value"'),
            }),
            403: _forbidden,
        },
    )
    def get(self, request):
        if not get_admin(request):
            return Response({'status': 'error', 'message': 'Forbidden'}, status=403)
        status_filter = request.query_params.get('status')
        queryset = Suggestion.objects.all().order_by('-created_at')
        if status_filter:
            if status_filter not in ('pending', 'approved', 'rejected'):
                return Response({'status': 'error', 'message': 'Invalid status value'}, status=400)
            queryset = queryset.filter(status=status_filter)
        serializer = SuggestionSerializer(queryset, many=True)
        return Response(serializer.data)


class SuggestionApproveView(APIView):

    @extend_schema(
        summary='Approve a suggestion (admin)',
        description=(
            'Approves a pending suggestion and automatically creates a **draft elective** (`status=0`) '
            'pre-filled with the suggestion data. The admin should then edit the draft elective '
            '(`PATCH /electives/{id}/`) to set `program_language` and `elective_type` before publishing.\n\n'
            'Requires `X-User-Email` admin header. Returns `400` if already approved.'
        ),
        request=None,
        responses={
            200: inline_serializer('ApproveResponse', fields={
                'status': s.CharField(help_text='"success"'),
                'message': s.CharField(),
                'elective_id': s.IntegerField(help_text='ID of the newly created draft elective'),
            }),
            400: inline_serializer('ApproveError', fields={
                'status': s.CharField(help_text='"error"'),
                'message': s.CharField(help_text='"Suggestion is already approved"'),
            }),
            403: _forbidden,
            404: _not_found,
        },
    )
    def post(self, request, pk):
        if not get_admin(request):
            return Response({'status': 'error', 'message': 'Forbidden'}, status=403)
        try:
            suggestion = Suggestion.objects.get(pk=pk)
        except Suggestion.DoesNotExist:
            return Response({'status': 'error', 'message': 'Suggestion not found'}, status=404)
        if suggestion.status == 'approved':
            return Response({'status': 'error', 'message': 'Suggestion is already approved'}, status=400)
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

    @extend_schema(
        summary='Reject a suggestion (admin)',
        description=(
            'Marks the suggestion as `rejected`. The author can still edit their submission '
            'via the edit link. Requires `X-User-Email` admin header.\n\n'
            'Returns `400` if the suggestion has already been approved — '
            'approved suggestions cannot be rejected.'
        ),
        request=None,
        responses={
            200: inline_serializer('RejectResponse', fields={
                'status': s.CharField(help_text='"success"'),
                'message': s.CharField(),
            }),
            400: inline_serializer('RejectError', fields={
                'status': s.CharField(help_text='"error"'),
                'message': s.CharField(help_text='"Cannot reject an already approved suggestion"'),
            }),
            403: _forbidden,
            404: _not_found,
        },
    )
    def post(self, request, pk):
        if not get_admin(request):
            return Response({'status': 'error', 'message': 'Forbidden'}, status=403)
        try:
            suggestion = Suggestion.objects.get(pk=pk)
        except Suggestion.DoesNotExist:
            return Response({'status': 'error', 'message': 'Suggestion not found'}, status=404)
        if suggestion.status == 'approved':
            return Response(
                {'status': 'error', 'message': 'Cannot reject an already approved suggestion'},
                status=400,
            )
        suggestion.status = 'rejected'
        suggestion.save()
        return Response({'status': 'success', 'message': 'Suggestion rejected'})


class SuggestionEditLinkView(APIView):

    @extend_schema(
        summary='Get edit link for a suggestion (admin)',
        description=(
            'Returns the frontend URL that allows the suggestion author to edit their submission '
            'without logging in. Share this link with the author after rejection.\n\n'
            'Requires `X-User-Email` admin header.'
        ),
        responses={
            200: inline_serializer('EditLinkResponse', fields={
                'edit_link': s.CharField(
                    help_text='Full frontend URL: {base}/suggestions/edit/{edit_token}',
                ),
            }),
            403: _forbidden,
            404: _not_found,
        },
    )
    def get(self, request, pk):
        if not get_admin(request):
            return Response({'status': 'error', 'message': 'Forbidden'}, status=403)
        try:
            suggestion = Suggestion.objects.get(pk=pk)
        except Suggestion.DoesNotExist:
            return Response({'status': 'error', 'message': 'Suggestion not found'}, status=404)
        frontend_base = 'http://localhost:3000'
        edit_link = f'{frontend_base}/suggestions/edit/{suggestion.edit_token}'
        return Response({'edit_link': edit_link})


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
                status=400,
            )
        return suggestion, None

    @extend_schema(
        summary='Get suggestion by edit token',
        description=(
            'Retrieves a suggestion using its unique `edit_token`. No authentication required — '
            'the token itself acts as authorization. '
            'Returns `404` if the token is invalid and `400` if the suggestion was already approved.'
        ),
        responses={
            200: SuggestionSerializer,
            400: inline_serializer('EditGetApprovedError', fields={
                'status': s.CharField(help_text='"error"'),
                'message': s.CharField(help_text='"Approved suggestions cannot be edited"'),
            }),
            404: _not_found,
        },
    )
    def get(self, request, token):
        suggestion, error = self._get_editable_suggestion(token)
        if error:
            return error
        serializer = SuggestionSerializer(suggestion, context={'request': request, 'is_admin': False})
        return Response(serializer.data)

    @extend_schema(
        summary='Edit suggestion by edit token',
        description=(
            'Allows the suggestion author to update their submission using the edit token. '
            'No authentication required. All fields are optional (partial update). '
            'After a successful edit the suggestion status is reset to `pending` for re-review.\n\n'
            'Returns `400` if the suggestion was already approved.'
        ),
        request=SuggestionCreateSerializer,
        responses={
            200: inline_serializer('EditPatchResponse', fields={
                'status': s.CharField(help_text='"success"'),
                'message': s.CharField(),
            }),
            400: inline_serializer('EditPatchError', fields={
                'status': s.CharField(help_text='"error"'),
                'errors': s.DictField(
                    help_text='Validation errors keyed by field name',
                    required=False,
                ),
                'message': s.CharField(required=False),
            }),
            404: _not_found,
        },
    )
    def patch(self, request, token):
        suggestion, error = self._get_editable_suggestion(token)
        if error:
            return error
        serializer = SuggestionCreateSerializer(suggestion, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({'status': 'error', 'errors': serializer.errors}, status=400)
        serializer.save(status='pending')
        return Response({'status': 'success', 'message': 'Suggestion updated'})
