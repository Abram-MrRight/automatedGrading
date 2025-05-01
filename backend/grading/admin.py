from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.hashers import make_password
from django.utils.translation import gettext_lazy as _
from django import forms

from .models import (
    Course, Exam, ExamSubmission, MarkingGuide, Grading,
    CustomUser, PlagiarismCheckReport
)

# Admin display settings
admin.site.site_header = "Automated Grading"
admin.site.site_title = "School Admin Portal"
admin.site.index_title = "Dashboard"

# Register regular models
admin.site.register(Exam)
admin.site.register(ExamSubmission)
admin.site.register(MarkingGuide)
admin.site.register(Grading)
admin.site.register(PlagiarismCheckReport)

class CustomUserAdminForm(forms.ModelForm):
    courses = forms.ModelMultipleChoiceField(
        queryset=Course.objects.all(),
        required=False,
        widget=admin.widgets.FilteredSelectMultiple("Courses", is_stacked=False)
    )

    class Meta:
        model = CustomUser
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Only show this for students
        if self.instance and self.instance.role != 'student':
            self.fields.pop('courses', None)
        else:
            self.fields['courses'].initial = self.instance.courses.all()

    def save(self, commit=True):
        instance = super().save(commit=False)
        if commit:
            instance.save()
        if instance.role == 'student':
            self.save_m2m()  # needed for enrolled_courses
            instance.courses.set(self.cleaned_data['courses'])
        return instance

# Customized CustomUser Admin
class CustomUserAdmin(UserAdmin):
    form = CustomUserAdminForm
    model = CustomUser

    list_display = (
        'username', 'email', 'role', 'is_staff', 'is_active', 'regNumber', 'age'
    )
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active', 'groups')

    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Personal Info'), {
            'fields': ('email', 'name', 'regNumber', 'age', 'profile_pic')
        }),
        (_('Role'), {'fields': ('role',)}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'role', 'is_staff', 'is_active'),
        }),
    )

    search_fields = ('username', 'email', 'regNumber')
    ordering = ('username',)

    def save_model(self, request, obj, form, change):
        if change:
            original_password = CustomUser.objects.get(pk=obj.pk).password
            if obj.password != original_password:
                obj.password = make_password(obj.password)
        else:
            obj.password = make_password(obj.password)
        super().save_model(request, obj, form, change)


class CourseAdminForm(forms.ModelForm):
    class Meta:
        model = Course
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Limit students to only users with role='student'
        self.fields['students'].queryset = CustomUser.objects.filter(role='student')

class CourseAdmin(admin.ModelAdmin):
    form = CourseAdminForm
    list_display = ('title', 'created_by', 'student_count')
    search_fields = ('title', 'description')
    filter_horizontal = ('students',)

    def student_count(self, obj):
        return obj.students.count()
    student_count.short_description = "Enrolled Students"

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Course, CourseAdmin)


