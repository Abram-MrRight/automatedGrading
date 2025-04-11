from django.urls import path, include
from django.contrib import admin
from .views import *
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView


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