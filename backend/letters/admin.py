from django.contrib import admin, messages
from django.utils import timezone
from .models import Letter, Report, Appreciation, ModerationLog

@admin.action(description="Approve selected letters")
def approve_letters(modeladmin, request, queryset):
    for letter in queryset:
        letter.status = Letter.Status.APPROVED
        letter.published_at = timezone.now()
        letter.save()
        ModerationLog.objects.create(letter=letter, moderator=request.user, action="approved")
    modeladmin.message_user(request, "Selected letters approved.", messages.SUCCESS)

@admin.action(description="Reject selected letters")
def reject_letters(modeladmin, request, queryset):
    for letter in queryset:
        letter.status = Letter.Status.REJECTED
        letter.save()
        ModerationLog.objects.create(letter=letter, moderator=request.user, action="rejected")
    modeladmin.message_user(request, "Selected letters rejected.", messages.SUCCESS)

@admin.register(Letter)
class LetterAdmin(admin.ModelAdmin):
    list_display = ("title", "emotion", "status", "created_at", "published_at", "is_featured")
    list_filter = ("status", "emotion", "created_at")
    search_fields = ("title", "body")
    readonly_fields = ("id", "created_at", "published_at")
    actions = [approve_letters, reject_letters]
    fieldsets = (
        ("Letter", {"fields": ("id", "title", "body", "emotion", "recipient_category")}),
        ("Publication", {"fields": ("status", "is_featured", "created_at", "published_at")}),
        ("Private moderation notes", {"fields": ("moderation_notes",)}),
    )

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ("letter", "reason", "created_at", "reviewed")
    list_filter = ("reason", "reviewed")
    readonly_fields = ("letter", "reason", "details", "created_at")

@admin.register(Appreciation)
class AppreciationAdmin(admin.ModelAdmin):
    list_display = ("letter", "created_at")
    readonly_fields = ("letter", "token_hash", "created_at")

@admin.register(ModerationLog)
class ModerationLogAdmin(admin.ModelAdmin):
    list_display = ("letter", "action", "moderator", "created_at")
    readonly_fields = ("letter", "moderator", "action", "notes", "created_at")
