from django.shortcuts import render
from django.http import HttpResponse
from rest_framework import viewsets
from .models import *
from .serializers import *
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status, permissions
from django.http import JsonResponse
from rest_framework.views import APIView
import logging
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny

from django.template.loader import get_template
from xhtml2pdf import pisa
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import Group

from rest_framework.permissions import IsAuthenticated
from .decorators import role_required



# Create your views here.

# This view home is for testing purposes
# def home(request):
#     return HttpResponse("Welcome to the Grading API")


class GradingReportListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        student_id = request.query_params.get('student_id')
        
        if not student_id:
            return Response({"error": "student_id query parameter is required"}, status=400)
        
        gradings = Grading.objects.select_related('student', 'exam_submission__exam')\
            .filter(student_id=student_id)\
            .order_by('-graded_on')
        
        serializer = GradingReportSerializer(gradings, many=True)
        return Response(serializer.data)

class UploadSubmissionAPIView(APIView):
    permission_classes = [AllowAny]
    queryset = ExamSubmission.objects.all()


    def post(self, request):
     serializer = ExamSubmissionSerializer(data=request.data)
     if serializer.is_valid():
        submission = serializer.save()

        # 🐛 Debugging: print the student
        # print("📌 Submitted student ID:", submission.student_id)
        # print("📌 Submitted student object:", submission.student)

        if not submission.student:
            return Response({"error": "Student not found or not attached to submission."}, status=status.HTTP_400_BAD_REQUEST)

        # Proceed with grading
        try:
            marking_guide = MarkingGuide.objects.get(exam=submission.exam)
        except MarkingGuide.DoesNotExist:
            return Response({"error": "No marking guide found for this exam."}, status=status.HTTP_400_BAD_REQUEST)

        grading = Grading.objects.create(
            exam_submission=submission,
            marking_guide=marking_guide,
            student=submission.student,
            grading_type='fair',
        )
        grading.process_grading()

        return Response({
            "message": "Submission uploaded and graded successfully.",
            "grade": grading.grade,
            "score": grading.grade_score,
            "comments": grading.comments,
        }, status=status.HTTP_201_CREATED)

     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # Get username and password from the request
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({"error": "Username and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        # Authenticate the user
        user = authenticate(username=username, password=password)
        print("Authenticated user:", user)

        if user is not None:
            # If authentication is successful, create JWT tokens
            refresh = RefreshToken.for_user(user)

            # Fetch user groups (roles)
            groups = user.groups.values_list('name', flat=True)
            role = groups[0] if groups else "student"  # Default to 'student' if no group is assigned

            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'role': role
            })

        # If authentication fails, log the error and return an error response
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    
class StudentDashboard(APIView):
    permission_classes = [IsAuthenticated]

    @role_required('student')
    def get(self, request):
        return Response({"message": "Welcome, Student!"})

class EducatorDashboard(APIView):
    permission_classes = [IsAuthenticated]

    @role_required('educator')
    def get(self, request):
        return Response({"message": "Welcome, Educator!"})

class AdminDashboard(APIView):
    permission_classes = [IsAuthenticated]

    @role_required('admin')
    def get(self, request):
        return Response({"message": "Welcome, Admin!"})


#APIs for the models
class StudentViewSet(viewsets.ModelViewSet):
    permission_classes = [
        permissions.AllowAny
    ]
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

    def create(self, request):
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            user.set_password(serializer.validated_data['password'])
            user.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
class CourseViewSet(viewsets.ModelViewSet):
    permission_classes = [
        permissions.AllowAny
    ]
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def list(self, request):
        serializer = CourseSerializer(self.queryset, many=True)
        return Response(serializer.data)

class ExamViewSet(viewsets.ModelViewSet):
    permission_classes = [
        permissions.AllowAny
    ]
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer

    def list(self, request):
        serializer = ExamSerializer(self.queryset, many=True)
        return Response(serializer.data)
    
class ExamSubmissionViewSet(viewsets.ModelViewSet):
    permission_classes = [
        AllowAny
        ]
    queryset = ExamSubmission.objects.all()
    serializer_class = ExamSubmissionSerializer

    def create(self, request, *args, **kwargs):
        file = request.FILES.get('file')
        exam_id = request.data.get('exam')

        if not file:
            return JsonResponse({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)
        if not exam_id:
            return JsonResponse({'error': 'Exam ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            exam = Exam.objects.get(id=exam_id)
        except Exam.DoesNotExist:
            return JsonResponse({'error': 'Exam not found'}, status=status.HTTP_404_NOT_FOUND)

        # Create Exam Submission object
        exam_submission = ExamSubmission.objects.create(
            exam=exam,
            file=file
        )

        # Process the submission (which will print the preprocessed text)

        # Convert processed text into vector embeddings

        # Store the vector embeddings in the ExamSubmission instance

        # Return the serialized response
        serializer = self.get_serializer(exam_submission)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
class MarkingGuideViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    queryset = MarkingGuide.objects.all()
    serializer_class = MarkingGuideSerializer

    def list(self, request):
        serializer = MarkingGuideSerializer(self.queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = MarkingGuideSerializer(data=request.data)
        if serializer.is_valid():
            marking_guide = serializer.save()

            # Ensure 'marking_guide_file' exists
            if not marking_guide.marking_guide_file:
                return Response({"error": "File not found in the saved object."}, status=status.HTTP_400_BAD_REQUEST)


        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GradingView(APIView):
    def post(self, request, *args, **kwargs):
        submission_id = request.data.get('submission_id')
        marking_guide_id = request.data.get('marking_guide_id')

        if not submission_id or not marking_guide_id:
            return Response({"error": "submission_id and marking_guide_id are required."},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            # Fetch the exam submission and marking guide
            exam_submission = ExamSubmission.objects.get(id=submission_id)
            marking_guide = MarkingGuide.objects.get(id=marking_guide_id)

            # Ensure that instances are passed, not raw text
            grading_service = GradingService()
            grade, similarity_score = grading_service.grade_submission(exam_submission, marking_guide)

            return Response({
                "grade": grade,
                "similarity_score": similarity_score
            }, status=status.HTTP_200_OK)

        except ExamSubmission.DoesNotExist:
            return Response({"error": "Submission not found."}, status=status.HTTP_404_NOT_FOUND)
        except MarkingGuide.DoesNotExist:
            return Response({"error": "Marking guide not found."}, status=status.HTTP_404_NOT_FOUND)
 
