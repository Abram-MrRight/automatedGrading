from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from grading.views import *
from django.views.generic import RedirectView 

grading_update = GradingUpdateView.as_view({
    'put': 'update_grade',
    'post': 'request_review',
})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', RedirectView.as_view(url='/admin/', permanent=True)),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('upload-submission/', UploadSubmissionAPIView.as_view(), name='upload-submission'),
    path('grading-report/', GradingReportListAPIView.as_view(), name='grading-report-list'),
    path('register/', RegisterView.as_view(), name='register'),
    path('gradings/<int:pk>/update-grade/', grading_update, name='update-grade'),
    path('gradings/<int:pk>/request-review/', grading_update, name='request-review'),
    path("grading-review-requests/", ReviewRequestsListAPIView.as_view(), name="grading-review-requests"),
    path("reports/", grading_report_view, name="grading-report-view"),
    path("educator/", educator_dashboard, name="educator-dashboard"),
    path("plagiarism-reports/", plagiarism_reports, name="plagiarism-reports"),
    path('exams/<int:exam_id>/plagiarism-check/', run_plagiarism_check, name='run-plagiarism-check'),
]
