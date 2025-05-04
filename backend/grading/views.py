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
from .models import CustomUser
from rest_framework.permissions import AllowAny

from django.template.loader import get_template
from xhtml2pdf import pisa
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import Group

from rest_framework.permissions import IsAuthenticated
from .decorators import role_required
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Avg, Count
from grading.models import Grading, Course
from datetime import datetime
from collections import defaultdict
from collections import Counter
import re
from django.db.models import F, ExpressionWrapper, FloatField

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

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")
        VALID_ROLES = ['educator', 'student']
        role = request.data.get("role")

        if role not in VALID_ROLES:
            return Response({"error": "Invalid role specified."}, status=status.HTTP_400_BAD_REQUEST)

        if not username or not email or not password or not role:
            return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

        if CustomUser.objects.filter(username=username).exists():
            return Response({"error": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)

        if CustomUser.objects.filter(email=email).exists():
            return Response({"error": "Email already in use"}, status=status.HTTP_400_BAD_REQUEST)

        user = CustomUser(username=username, email=email, role=role)
        user.set_password(password)
        user.save()

        group, _ = Group.objects.get_or_create(name=role)
        user.groups.add(group)

        return Response({"message": "Registration successful"}, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({"error": "Username and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        # Authenticate the user
        user = authenticate(username=username, password=password)
        print("Authenticated user:", user)

        if user is not None and user.is_active:
            # Create JWT tokens
            refresh = RefreshToken.for_user(user)

            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'role': user.role,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'name': getattr(user, 'name', ''),
                    'regNumber': getattr(user, 'regNumber', ''),
                }
            })

        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    
class StudentDashboard(APIView):
    permission_classes = [IsAuthenticated]

    @role_required('student')
    def get(self, request):
        return Response({"message": "Welcome, Student!"})

@api_view(['GET'])
def educator_dashboard(request):
    user = request.user
    if user.role != 'educator':
        return Response({"detail": "Only educators can access this."}, status=403)

    courses = Course.objects.filter(created_by=user)
    exams = Exam.objects.filter(course__in=courses)
    submissions = ExamSubmission.objects.filter(exam__in=exams)
    students = CustomUser.objects.filter(submissions__exam__in=exams).distinct()

    gradings = Grading.objects.filter(exam_submission__exam__in=exams)
    avg_score = gradings.aggregate(Avg("grade_score"))["grade_score__avg"] or 0
    review_requests = gradings.filter(review_requested=True).count()
    ai_count = gradings.filter(reviewed_by_educator=False).count()
    manual_count = gradings.filter(reviewed_by_educator=True).count()

    plagiarism_flags = PlagiarismCheckReport.objects.filter(
        source_submission__exam__in=exams,
        is_flagged=True
    ).count()

    return Response({
        "total_courses": courses.count(),
        "total_exams": exams.count(),
        "total_submissions": submissions.count(),
        "unique_students": students.count(),
        "average_score": round(avg_score, 2),
        "ai_graded_count": ai_count,
        "manual_graded_count": manual_count,
        "review_requests": review_requests,
        "plagiarism_flags": plagiarism_flags,
    })

class AdminDashboard(APIView):
    permission_classes = [IsAuthenticated]

    @role_required('admin')
    def get(self, request):
        return Response({"message": "Welcome, Admin!"})

class StudentViewSet(viewsets.ModelViewSet):
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Educators or admins see all students
        user = self.request.user
        if user.role in ['educator', 'admin']:
            return CustomUser.objects.filter(role='student')
        else:
            # A student only sees their own record
            return CustomUser.objects.filter(id=user.id)

    def perform_create(self, serializer):
        serializer.save(role='student')

    def perform_update(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        instance.delete()
    
    @action(detail=False, methods=['get'], url_path='me')
    def get_me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'], url_path='dashboard')
    def student_dashboard(self, request, pk=None):
        try:
            user = CustomUser.objects.get(id=pk, role='student')
        except CustomUser.DoesNotExist:
            return Response({'detail': 'Student not found.'}, status=status.HTTP_404_NOT_FOUND)

        enrolled_courses = user.enrolled_courses.all()
        total_courses = enrolled_courses.count()

        total_exams = Exam.objects.filter(course__in=enrolled_courses).count()

        submissions = ExamSubmission.objects.filter(student=user)
        total_submitted = submissions.count()
        late_submissions = sum(1 for s in submissions if s.submission_time > s.exam.end_time)
        on_time = total_submitted - late_submissions

        gradings = Grading.objects.filter(student=user)
        avg_score = gradings.aggregate(Avg("grade_score"))["grade_score__avg"]
        grade_distribution = gradings.values("grade").annotate(count=Count("grade"))

        reviews = gradings.filter(review_requested=True).count()
        flags = PlagiarismCheckReport.objects.filter(source_submission__student=user, is_flagged=True).count()

        recent = gradings.order_by("-graded_on")[:5]
        recent_grades = [
            {
                "exam": g.exam_submission.exam.title,
                "grade": g.grade,
                "score": g.grade_score,
                "feedback": g.comments[:100] + "..." if g.comments else "No feedback"
            } for g in recent
        ]

        return Response({
            "courses": total_courses,
            "exams": total_exams,
            "submitted": total_submitted,
            "on_time": on_time,
            "late": late_submissions,
            "average_score": round(avg_score or 0, 2),
            "grade_distribution": grade_distribution,
            "review_requests": reviews,
            "plagiarism_flags": flags,
            "recent_grades": recent_grades,
        })

    
class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'educator':
            return Course.objects.filter(created_by=user)
        return user.enrolled_courses.all()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        course = self.get_object()
        user = request.user

        if user.role == 'educator' and course.created_by != user:
            return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

        if user.role == 'student' and not course.students.filter(id=user.id).exists():
            return Response({"detail": "Not enrolled in this course."}, status=status.HTTP_403_FORBIDDEN)

        return super().retrieve(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        course = self.get_object()
        if course.created_by != request.user:
            return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        course = self.get_object()
        if course.created_by != request.user:
            return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

    # ✅ GET /courses/all/ — all courses (for student enrollment list)
    @action(detail=False, methods=["get"], url_path="all")
    def all_courses(self, request):
        courses = Course.objects.all()
        serializer = self.get_serializer(courses, many=True)
        return Response(serializer.data)

    # ✅ GET /courses/student/ — courses the student is enrolled in
    @action(detail=False, methods=["get"], url_path="student")
    def student_courses(self, request):
        if request.user.role != "student":
            return Response({"detail": "Only students can view their courses."}, status=status.HTTP_403_FORBIDDEN)
        courses = request.user.enrolled_courses.all()
        serializer = self.get_serializer(courses, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=["post"], url_path="enroll")
    def enroll(self, request, pk=None):
        course = get_object_or_404(Course, pk=pk)
        course.students.add(request.user)
        return Response({"detail": "Enrolled successfully!"})

    @action(detail=True, methods=["post"], url_path="unenroll")
    def unenroll(self, request, pk=None):
        course = get_object_or_404(Course, pk=pk)
        course.students.remove(request.user)
        return Response({"detail": "Unenrolled successfully!"})

from rest_framework.permissions import IsAuthenticated

class ExamViewSet(viewsets.ModelViewSet):
    serializer_class = ExamSerializer
    queryset = Exam.objects.all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # For educators/admins: return all exams
        if user.role in ['educator', 'admin']:
            return Exam.objects.all()

        # For students: only exams from enrolled courses
        elif user.role == 'student':
            return Exam.objects.filter(course__in=user.enrolled_courses.all())

        return Exam.objects.none()
    
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
    
class MarkingGuideViewSet(viewsets.ModelViewSet):
    queryset = MarkingGuide.objects.all()
    serializer_class = MarkingGuideSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = MarkingGuideSerializer(data=request.data)
        if serializer.is_valid():
            marking_guide = serializer.save()

            # Ensure the file is really there
            if not marking_guide.marking_guide_file:
                return Response({"error": "File not found in the saved object."}, status=status.HTTP_400_BAD_REQUEST)

            return Response(MarkingGuideSerializer(marking_guide).data, status=status.HTTP_201_CREATED)

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
 
class GradingUpdateView(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    @action(detail=True, methods=['put'])
    def update_grade(self, request, pk=None):
        try:
            grading = Grading.objects.get(id=pk)
        except Grading.DoesNotExist:
            return Response({"error": "Grading record not found."}, status=status.HTTP_404_NOT_FOUND)

        new_grade = request.data.get("grade")
        new_comments = request.data.get("comments")

        if not new_grade:
            return Response({"error": "Grade is required."}, status=status.HTTP_400_BAD_REQUEST)

        grading.grade = new_grade
        if new_comments is not None:
            grading.comments = new_comments

        grading.is_graded_automatically = False
        grading.reviewed_by_educator = True
        grading.save()

        return Response({
            "message": "Grade updated successfully.",
            "grade": grading.grade,
            "comments": grading.comments,
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], url_path='request-review')
    def request_review(self, request, pk=None):
        try:
            grading = Grading.objects.get(id=pk)
        except Grading.DoesNotExist:
            return Response({"error": "Grading record not found."}, status=status.HTTP_404_NOT_FOUND)

        grading.review_requested = True
        grading.save(update_fields=["review_requested"])

        return Response({
            "message": "Review request submitted successfully.",
            "review_requested": grading.review_requested
        }, status=status.HTTP_200_OK)

class ReviewRequestsListAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'educator':
            return Response({"detail": "Forbidden"}, status=403)
        
        gradings = Grading.objects.filter(review_requested=True, reviewed_by_educator=False)\
            .select_related("student", "exam_submission__exam")

        serializer = GradingReportSerializer(gradings, many=True)
        return Response(serializer.data)

@api_view(['GET'])
def grading_report_view(request):
    # === 1. Grading trends by month ===
    monthly_data = Grading.objects.annotate(month=models.functions.TruncMonth("graded_on")) \
        .values("month") \
        .annotate(average_score=Avg("grade_score")) \
        .order_by("month")

    grading_trends = [
        {
            "month": item["month"].strftime("%b %Y"),
            "average_score": float(item["average_score"] or 0)
        }
        for item in monthly_data
    ]

    # === 2. Performance by course ===
    course_stats = Grading.objects.select_related("exam_submission__exam__course") \
        .values("exam_submission__exam__course__title") \
        .annotate(avg_score=Avg("grade_score"))

    course_performance = [
        {
            "course": item["exam_submission__exam__course__title"],
            "avg_score": float(item["avg_score"] or 0)
        }
        for item in course_stats
    ]

    # === 3. AI vs Manual grading ===
    ai_count = Grading.objects.filter(grading_type__in=["fair", "lenient", "strict"]).count()
    manual_count = Grading.objects.filter(reviewed_by_educator=True).count()

    # === 4. Deviation and Grade Changes ===
    graded_with_ai = Grading.objects.exclude(
        initial_grade_score__isnull=True,
        grade_score__isnull=True
    ).annotate(
        score_diff=ExpressionWrapper(
            models.functions.Abs(F('grade_score') - F('initial_grade_score')),
            output_field=FloatField()
        )
    )

    deviation_scores = [g.score_diff for g in graded_with_ai if g.score_diff is not None]
    average_deviation = round(sum(deviation_scores) / len(deviation_scores), 2) if deviation_scores else 0.0

    # === Count grade adjustments (AI grade vs educator override)
    grade_adjustments = Grading.objects.exclude(
        initial_grade_score__isnull=True,
        grade_score__isnull=True
    ).exclude(
        initial_grade_score=F('grade_score')
    ).count()

    # === 5. Common mistakes (from comments) ===
    comments_qs = Grading.objects.exclude(comments__isnull=True).exclude(comments__exact="")
    all_comments = " ".join(comments_qs.values_list("comments", flat=True))

    # Extract keywords using simple word splitting
    words = re.findall(r'\b[a-zA-Z]{4,}\b', all_comments.lower())  # 4+ letter words
    word_freq = Counter(words)
    common_mistakes = [word.capitalize() for word, _ in word_freq.most_common(5)]

    return Response({
        "grading_trends": grading_trends,
        "course_performance": course_performance,
        "ai_grading_count": ai_count,
        "manual_grading_count": manual_count,
        "average_deviation": average_deviation,
        "grade_adjustments": grade_adjustments,
        "common_mistakes": common_mistakes
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def plagiarism_reports(request):
    reports = PlagiarismCheckReport.objects.select_related("source_submission", "compared_submission").all()
    serializer = PlagiarismReportSerializer(reports, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def run_plagiarism_check(request, exam_id):
    try:
        exam = Exam.objects.get(id=exam_id)
        PlagiarismCheckReport.generate_report_for_exam(exam)
        return Response({"detail": "Plagiarism check completed ✅"}, status=status.HTTP_200_OK)
    except Exam.DoesNotExist:
        return Response({"error": "Exam not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)