from django.urls import path, include
from django.contrib import admin
from .views import *
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # ... your other routes
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)



router = DefaultRouter()


# This Home is test page
# urlpatterns = [
#     path('', home),
# ]


#creating APIs
router.register('students', StudentViewSet, basename='students')
router.register('courses', CourseViewSet, basename='courses')
router.register('exams', ExamViewSet, basename='exams')
router.register('submissions', ExamSubmissionViewSet, basename='submissions')
router.register('marking_guides', MarkingGuideViewSet, basename='marking_guides')

urlpatterns = router.urls

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)