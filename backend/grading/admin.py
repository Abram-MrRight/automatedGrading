from django.contrib import admin
from .models import Student, Course, Exam, ExamSubmission, MarkingGuide, Grading, CustomUser, PlagiarismCheckReport

from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.hashers import make_password
from django.utils.translation import gettext_lazy as _
from .models import CustomUser  # Change to your actual user model

# Register your models here.
admin.site.register(Student)
admin.site.register(Course)
admin.site.register(Exam)
admin.site.register(ExamSubmission)
admin.site.register(MarkingGuide)
admin.site.register(Grading)
admin.site.register(PlagiarismCheckReport)

admin.site.site_header = "Automated Grading"
admin.site.site_title = "School Admin Portal"
admin.site.index_title = "Dashboard"

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('username', 'email', 'is_staff', 'is_active')
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Personal info'), {'fields': ('email',)}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'groups')}),
    )
    
    def save_model(self, request, obj, form, change):
        # Hash the password only if it's a new user or if the password has changed
        if change:
            original_password = CustomUser.objects.get(pk=obj.pk).password
            if obj.password != original_password:
                obj.password = make_password(obj.password)
        else:
            obj.password = make_password(obj.password)
        
        super().save_model(request, obj, form, change)

admin.site.register(CustomUser, CustomUserAdmin)