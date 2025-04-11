from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from grading.views import LoginView, UploadSubmissionAPIView,GradingReportListAPIView




urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('grading.urls')),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('upload-submission/', UploadSubmissionAPIView.as_view(), name='upload-submission'),
    path('grading-report/', GradingReportListAPIView.as_view(), name='grading-report-list'),

]
