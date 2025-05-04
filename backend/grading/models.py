from django.db import models
from .utils.text_processing import extract_text_from_file, preprocess_text, serialize_embeddings, deserialize_embeddings
from .utils.grading_service import GradingService
from .utils.plagiarism_checker import PlagiarismChecker
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.utils.timezone import localtime

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('educator', 'Educator'),
        ('student', 'Student'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')

    # Student-specific fields
    name = models.CharField(max_length=100, null=True, blank=True)
    age = models.IntegerField(null=True, blank=True)
    regNumber = models.CharField(max_length=100, null=True, blank=True, unique=True)
    profile_pic = models.ImageField(upload_to='media/profile_pics/', null=True, blank=True)

    def __str__(self):
        return self.username

# Create your models here.    
class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    created_by = models.ForeignKey('CustomUser', on_delete=models.CASCADE, related_name='courses')
    students = models.ManyToManyField('CustomUser', limit_choices_to={'role': 'student'}, related_name='enrolled_courses', blank=True)

    def __str__(self):
        return self.title

class Exam(models.Model):
    title = models.CharField(max_length=200)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='exams')
    description = models.TextField()
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    exam_file = models.FileField(upload_to='media/exams/', null=True, blank=True)
    
    def __str__(self):
        return self.title

class ExamSubmission(models.Model):
    exam = models.ForeignKey("Exam", on_delete=models.CASCADE, related_name="submissions")
    student = models.ForeignKey("CustomUser", on_delete=models.CASCADE, related_name="submissions", null=True, blank=True)
    file = models.FileField(upload_to="media/submissions/", blank=True, null=True)
    submission_time = models.DateTimeField(auto_now_add=True)
    preprocessed_text = models.TextField(null=True, blank=True)
    vector_embeddings = models.BinaryField(null=True, blank=True)

    def __str__(self):
        return f"Submitted by {self.student.name if self.student else 'Unknown'} for {self.exam.title}"
    
    def process_submission(self):
      """Extract and preprocess text, then store it."""
      if self.file and self.file.name:  # Ensure the file exists
        try:
            raw_text = extract_text_from_file(self.file.path)
            cleaned_text = preprocess_text(raw_text)
            self.preprocessed_text = cleaned_text
        except Exception as e:
            print(f"Error processing submission: {e}")

    def save(self, *args, **kwargs):
     """Save instance and preprocess submission without recursion."""
     if not self.preprocessed_text:  # Avoid re-processing
        self.process_submission()
     super().save(*args, **kwargs)  # Save after processing

    def store_vector_embeddings(self, embeddings):
        """Store vector embeddings in serialized binary format."""
        self.vector_embeddings = serialize_embeddings(embeddings)
        self.save()

    def get_vector_embeddings(self):
        """Retrieve stored vector embeddings as a NumPy array."""
        return deserialize_embeddings(self.vector_embeddings)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)  # Save the instance first
        self.process_submission()  # Process text after saving

class MarkingGuide(models.Model):
    GRADING_OPTIONS = [
        ('fair', 'Fair Grading'),
        ('lenient', 'Lenient Grading'),
        ('strict', 'Strict Grading'),
    ]

    exam = models.OneToOneField('Exam', on_delete=models.CASCADE, related_name='marking_guide')
    marking_guide_file = models.FileField(upload_to='media/marking_guides/', null=True, blank=True)
    grading_type = models.CharField(max_length=10, choices=GRADING_OPTIONS, default='fair')
    preprocessed_text = models.TextField(null=True, blank=True)
    vector_embeddings = models.BinaryField(null=True, blank=True)

    def __str__(self):
        return f"Marking Guide for {self.exam.title}"
    
    def process_marking_guide(self):
        """Extracts and preprocesses text, then stores it."""
        
        if self.marking_guide_file and self.marking_guide_file.name:
            try:
                raw_text = extract_text_from_file(self.marking_guide_file.path)
                cleaned_text = preprocess_text(raw_text)
                self.preprocessed_text = cleaned_text

            except Exception as e:
                print(f"Error processing marking guide: {e}")

    def save(self, *args, **kwargs):
        """Save instance and preprocess submission without recursion."""
        if not self.preprocessed_text:  # Avoid re-processing
          self.process_marking_guide()
        super().save(*args, **kwargs)  # Save after processing


    def store_vector_embeddings(self, embeddings):
        """Store vector embeddings in serialized binary format."""
        self.vector_embeddings = serialize_embeddings(embeddings)
        self.save()

    def get_vector_embeddings(self):
        """Retrieve stored vector embeddings as a NumPy array."""
        return deserialize_embeddings(self.vector_embeddings)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.process_marking_guide()

class Grading(models.Model):
    GRADING_OPTIONS = [
        ('fair', 'Fair Grading'),
        ('lenient', 'Lenient Grading'),
        ('strict', 'Strict Grading'),
    ]
    exam_submission = models.ForeignKey('ExamSubmission', on_delete=models.CASCADE, related_name='grading')
    marking_guide = models.ForeignKey('MarkingGuide', on_delete=models.CASCADE, null=True, blank=True, related_name='grading')
    student = models.ForeignKey("CustomUser", on_delete=models.CASCADE, related_name="gradings", null=True, blank=True)

    grade = models.CharField(max_length=10, null=True, blank=True)
    grade_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)  # Current grade
    initial_grade_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)  # Preserve AI score

    graded_on = models.DateTimeField(auto_now_add=True)
    grading_type  = models.CharField(max_length=10, choices=GRADING_OPTIONS, default='fair')
    comments = models.TextField(null=True, blank=True)
    review_requested = models.BooleanField(default=False)
    reviewed_by_educator = models.BooleanField(default=False)

    def __str__(self):
        student_name = self.student.name if self.student else "Unknown Student"
        exam_name = self.exam_submission.exam.title if self.exam_submission and self.exam_submission.exam else "Unknown Exam"
        graded_time = localtime(self.graded_on).strftime("%Y-%m-%d %H:%M")
        return f"{student_name} | {self.grade or 'No Grade'} | {exam_name} | {graded_time}"

    def process_grading(self):
        """Extract text, preprocess, and use AI grading, then store results."""
        if self.grading_type and not self.grade:
            try:
                grading_service = GradingService()

                # Extract student answer
                student_answer = extract_text_from_file(self.exam_submission.file.path)
                cleaned_student_answer = preprocess_text(student_answer)

                # Extract marking guide
                marking_guide_text = ""
                grading_type = self.grading_type

                if self.marking_guide and self.marking_guide.marking_guide_file:
                    raw_marking_guide = extract_text_from_file(self.marking_guide.marking_guide_file.path)
                    marking_guide_text = preprocess_text(raw_marking_guide)
                    grading_type = self.marking_guide.grading_type

                # AI Grading
                if self.grading_type == 'fair':
                    grade, similarity_score, feedback = grading_service.fair_grading(cleaned_student_answer, marking_guide_text)
                elif self.grading_type == 'lenient':
                    grade, similarity_score, feedback = grading_service.lenient_grading(cleaned_student_answer, marking_guide_text)
                elif self.grading_type == 'strict':
                    grade, similarity_score, feedback = grading_service.strict_grading(cleaned_student_answer, marking_guide_text)
                else:
                    grade, similarity_score, feedback = "N/A", 0.0, "Unknown grading type"

                # Save both final and initial scores
                self.grade = grade
                self.grade_score = similarity_score
                if self.initial_grade_score is None:
                    self.initial_grade_score = similarity_score  # Preserve initial AI score
                self.comments = feedback
                self.grading_type = grading_type
                self.save()

            except Exception as e:
                print(f"Error processing grading: {e}")

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        if is_new or (self.grading_type and not self.grade):
            try:
                self.process_grading()
                super().save(update_fields=['grade', 'grade_score', 'initial_grade_score', 'comments'])
            except Exception as e:
                print(f"Error during grading save: {e}")

class PlagiarismCheckReport(models.Model):
    source_submission = models.ForeignKey(
        "ExamSubmission",
        on_delete=models.CASCADE,
        related_name="plagiarism_checks"
    )
    compared_submission = models.ForeignKey(
        "ExamSubmission",
        on_delete=models.CASCADE,
        related_name="compared_to_checks"
    )
    similarity_score = models.FloatField()
    is_flagged = models.BooleanField(default=False)
    checked_on = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('source_submission', 'compared_submission')

    def __str__(self):
        return f"{self.source_submission} vs {self.compared_submission} | {self.similarity_score:.2f}"

    @staticmethod
    def generate_report_for_exam(exam, threshold=0.6):
        """
        Generate plagiarism reports for all submissions in a given exam.
        """
        submissions = list(exam.submissions.all())

        checker = PlagiarismChecker(threshold=threshold)
        results = checker.check_plagiarism(submissions)

        for key, score in results.items():
            try:
                sid1, sid2 = map(int, key.split(" vs "))
                sub1 = ExamSubmission.objects.get(id=sid1)
                sub2 = ExamSubmission.objects.get(id=sid2)

                # Create or update the plagiarism report
                report, created = PlagiarismCheckReport.objects.get_or_create(
                    source_submission=sub1,
                    compared_submission=sub2,
                    defaults={
                        'similarity_score': score,
                        'is_flagged': score >= threshold,
                        'checked_on': timezone.now()
                    }
                )
                if not created:
                    report.similarity_score = score
                    report.is_flagged = score >= threshold
                    report.checked_on = timezone.now()
                    report.save()
            except Exception as e:
                print(f"❌ Error saving report for {key}: {e}")