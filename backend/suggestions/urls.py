from django.urls import path
from .views import SuggestionListView, SuggestionApproveView, SuggestionRejectView, SuggestionEditView, SuggestionEditLinkView

urlpatterns = [
    path('suggestions', SuggestionListView.as_view(), name='suggestion-list'),
    path('suggestions/<int:pk>/approve', SuggestionApproveView.as_view(), name='suggestion-approve'),
    path('suggestions/<int:pk>/reject', SuggestionRejectView.as_view(), name='suggestion-reject'),
    path('suggestions/<int:pk>/edit-link', SuggestionEditLinkView.as_view(), name='suggestion-edit-link'),
    path('suggestions/edit/<uuid:token>', SuggestionEditView.as_view(), name='suggestion-edit'),
]
