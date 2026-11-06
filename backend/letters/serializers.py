from rest_framework import serializers
from .models import Letter, Report, EMOTIONS, RECIPIENTS

class LetterSerializer(serializers.ModelSerializer):
    emotion_label = serializers.CharField(source="get_emotion_display", read_only=True)
    appreciation_count = serializers.IntegerField(read_only=True)
    class Meta:
        model = Letter
        fields = ["id", "title", "body", "emotion", "emotion_label", "recipient_category",
                  "published_at", "appreciation_count"]
        read_only_fields = ["id", "published_at", "appreciation_count"]

class LetterCreateSerializer(serializers.ModelSerializer):
    consent = serializers.BooleanField(write_only=True)
    class Meta:
        model = Letter
        fields = ["title", "body", "emotion", "recipient_category", "consent"]
    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Please add a title.")
        return value
    def validate_body(self, value):
        value = value.strip()
        if len(value) < 20:
            raise serializers.ValidationError("Your letter needs at least 20 characters.")
        if len(value) > 5000:
            raise serializers.ValidationError("Letters can be up to 5,000 characters.")
        return value
    def validate_consent(self, value):
        if not value:
            raise serializers.ValidationError("Please confirm the publishing and community guidelines.")
        return value
    def create(self, validated_data):
        validated_data.pop("consent")
        return Letter.objects.create(**validated_data, status=Letter.Status.PENDING)

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ["letter", "reason", "details"]
    def validate_letter(self, value):
        if value.status != Letter.Status.APPROVED:
            raise serializers.ValidationError("This letter cannot be reported.")
        return value
    def validate_details(self, value):
        if len(value) > 1000:
            raise serializers.ValidationError("Please keep details under 1,000 characters.")
        return value
