from .models import *
from rest_framework import serializers


class GradingReportSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    exam_name = serializers.SerializerMethodField()
    download_pdf_url = serializers.SerializerMethodField()
    graded_on = serializers.SerializerMethodField()

    class Meta:
        model = Grading
        fields = [
            'id', 'student_name', 'exam_name', 'grade_score', 'grade',
            'grading_type', 'comments', 'graded_on', 'download_pdf_url'
        ]

    def get_student_name(self, obj):
        return obj.student.name if obj.student else "Unknown"

    def get_exam_name(self, obj):
        return obj.exam_submission.exam.title if obj.exam_submission and obj.exam_submission.exam else "Unknown"

    def get_download_pdf_url(self, obj):
        return f"/api/gradings/{obj.id}/download-report/"

    def get_graded_on(self, obj):
        return obj.graded_on.strftime('%Y-%m-%d %H:%M')
    
class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'

class ExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exam
        fields = '__all__'

class MarkingGuideSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarkingGuide
        fields = '__all__'
    
    def validate_preprocessed_text(self, value):
        # If preprocessed_text is empty, set it to None
        if not value:
            return None
        return value

    def validate_vector_embeddings(self, value):
        # If vector_embeddings is empty, set it to None
        if not value:
            return None
        return value
    

class ExamSubmissionSerializer(serializers.ModelSerializer):
    exam = serializers.PrimaryKeyRelatedField(queryset=Exam.objects.all())
    # student = serializers.HiddenField(default=serializers.CurrentUserDefault())  # Automatically assign the current user
    file = serializers.FileField()  # This field should accept the uploaded file

    class Meta:
        model = ExamSubmission
        fields = ['exam', 'student', 'file']  # Include all necessary fields

    def create(self, validated_data):
        # Extract the student, exam, and file from validated data
        exam = validated_data['exam']
        file = validated_data.get('file')  # Optional, depending on if file is part of submission
        student = validated_data['student']

        # Ensure that the student is properly associated with the exam submission
        exam_submission = ExamSubmission.objects.create(
            exam=exam,
            file=file,  # Only include file if it exists
            student=student
        )

        return exam_submission