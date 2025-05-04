from .models import *
from rest_framework import serializers


class GradingReportSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    exam_name = serializers.SerializerMethodField()
    download_pdf_url = serializers.SerializerMethodField()
    submission_file_url = serializers.SerializerMethodField()
    graded_on = serializers.SerializerMethodField()
    review_requested = serializers.BooleanField()
    reviewed_by_educator = serializers.BooleanField()

    class Meta:
        model = Grading
        fields = [
            'id', 'student_name', 'exam_name', 'grade_score', 'grade',
            'grading_type', 'comments', 'graded_on', 'download_pdf_url',
            'submission_file_url', 'review_requested', 'reviewed_by_educator'
        ]

    def get_student_name(self, obj):
        return obj.student.name if obj.student else "Unknown"

    def get_exam_name(self, obj):
        return obj.exam_submission.exam.title if obj.exam_submission and obj.exam_submission.exam else "Unknown"

    def get_download_pdf_url(self, obj):
        return f"/gradings/{obj.id}/download-report/"

    def get_graded_on(self, obj):
        return obj.graded_on.strftime('%Y-%m-%d %H:%M')
    
    def get_submission_file_url(self, obj):
        if obj.exam_submission and obj.exam_submission.file:
            return obj.exam_submission.file.url
        return None
    
class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'name', 'age', 'regNumber', 'profile_pic', 'courses', 'password']
        read_only_fields = ['id']
        extra_kwargs = {'password': {'write_only': True, 'required': False}}

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.role = 'student'
        user.save()
        return user

    def update(self, instance, validated_data):
        # Handle courses separately
        courses = validated_data.pop('courses', None)
        password = validated_data.pop('password', None)

        # Update normal fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Handle password update
        if password:
            instance.set_password(password)
            instance.save()

        # Handle ManyToMany courses
        if courses is not None:
            instance.courses.set(courses)

        return instance

class CourseSerializer(serializers.ModelSerializer):
    students = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'created_by', 'students']

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

class PlagiarismReportSerializer(serializers.ModelSerializer):
    source_student = serializers.SerializerMethodField()
    compared_student = serializers.SerializerMethodField()
    exam_title = serializers.SerializerMethodField()

    class Meta:
        model = PlagiarismCheckReport
        fields = [
            'id', 'similarity_score', 'is_flagged', 'checked_on',
            'source_student', 'compared_student', 'exam_title'
        ]

    def get_source_student(self, obj):
        return obj.source_submission.student.name if obj.source_submission and obj.source_submission.student else "Unknown"

    def get_compared_student(self, obj):
        return obj.compared_submission.student.name if obj.compared_submission and obj.compared_submission.student else "Unknown"

    def get_exam_title(self, obj):
        return obj.source_submission.exam.title if obj.source_submission and obj.source_submission.exam else "N/A"
