import uuid
from django.db import models
from django.utils import timezone

EMOTIONS = [
    ("love", "Love"), ("regret", "Regret"), ("gratitude", "Gratitude"),
    ("grief", "Grief"), ("hope", "Hope"), ("goodbye", "Goodbye"),
]
RECIPIENTS = [
    ("someone_loved", "Someone I loved"), ("friend", "A friend"),
    ("family", "Family"), ("younger_self", "My younger self"),
    ("future_self", "My future self"), ("someone_lost", "Someone I lost"),
    ("never_met", "Someone I never met"), ("unnamed", "Someone I cannot name"),
    ("other", "Other"),
]

class Letter(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending review"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"
        REMOVED = "removed", "Removed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=100)
    body = models.TextField(max_length=5000)
    emotion = models.CharField(max_length=20, choices=EMOTIONS)
    recipient_category = models.CharField(max_length=30, choices=RECIPIENTS, blank=True)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.PENDING)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    published_at = models.DateTimeField(null=True, blank=True)
    moderation_notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-published_at", "-created_at"]
        indexes = [
            models.Index(fields=["status", "published_at"]),
            models.Index(fields=["emotion", "status"]),
        ]

    def save(self, *args, **kwargs):
        if self.status == self.Status.APPROVED and not self.published_at:
            self.published_at = timezone.now()
        if self.status != self.Status.APPROVED:
            self.published_at = None
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

class Appreciation(models.Model):
    letter = models.ForeignKey(Letter, on_delete=models.CASCADE, related_name="appreciations")
    token_hash = models.CharField(max_length=64)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["letter", "token_hash"], name="unique_letter_appreciation")]

class Report(models.Model):
    REASONS = [
        ("identifying_info", "Personal identifying information"),
        ("harassment", "Harassment or bullying"), ("threats", "Threats"),
        ("hate", "Hate or discrimination"), ("spam", "Spam or malicious links"),
        ("other", "Other"),
    ]
    letter = models.ForeignKey(Letter, on_delete=models.CASCADE, related_name="reports")
    reason = models.CharField(max_length=30, choices=REASONS)
    details = models.CharField(max_length=1000, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    reviewed = models.BooleanField(default=False)

    def __str__(self):
        return f"Report: {self.reason} — {self.letter_id}"

class ModerationLog(models.Model):
    letter = models.ForeignKey(Letter, on_delete=models.CASCADE, related_name="moderation_logs")
    moderator = models.ForeignKey("auth.User", null=True, blank=True, on_delete=models.SET_NULL)
    action = models.CharField(max_length=30)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(default=timezone.now)
