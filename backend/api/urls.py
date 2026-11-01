from django.urls import path
from .views import (
    ComplaintCreateView, ComplaintFeedView, HealthView, LoginView, ProfileView, SignupView,
    SmartPreviewView, StatusUpdateView, UpvoteView,
)

urlpatterns = [
    path("health/", HealthView.as_view()),
    path("auth/login/", LoginView.as_view()),
    path("auth/signup/", SignupView.as_view()),
    path("auth/profile/", ProfileView.as_view()),
    path("complaints/smart-preview/", SmartPreviewView.as_view()),
    path("complaints/", ComplaintCreateView.as_view()),
    path("complaints/feed/", ComplaintFeedView.as_view()),
    path("complaints/<str:complaint_id>/upvote/", UpvoteView.as_view()),
    path("admin/complaints/<str:complaint_id>/status/", StatusUpdateView.as_view()),
]
