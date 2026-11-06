import hashlib
import secrets
from django.db.models import Count
from django.shortcuts import get_object_or_404
from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, throttle_classes
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from .models import Letter, Appreciation, Report, EMOTIONS, RECIPIENTS
from .serializers import LetterSerializer, LetterCreateSerializer, ReportSerializer

def anon_hash(request):
    raw = request.headers.get("X-Anonymous-Token", "")
    if not raw:
        raw = secrets.token_urlsafe(24)
    return hashlib.sha256(raw.encode()).hexdigest()

class LetterListView(generics.ListAPIView):
    serializer_class = LetterSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "body"]
    ordering_fields = ["published_at", "title"]
    ordering = ["-published_at"]

    def get_queryset(self):
        qs = Letter.objects.filter(status=Letter.Status.APPROVED).annotate(
            appreciation_count=Count("appreciations", distinct=True)
        )
        emotion = self.request.query_params.get("emotion")
        if emotion:
            qs = qs.filter(emotion=emotion)
        return qs

class LetterCreateView(generics.CreateAPIView):
    serializer_class = LetterCreateSerializer
    throttle_classes = [AnonRateThrottle]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        letter = serializer.save()
        return Response({"message": "Your letter has been received for review.", "id": str(letter.id)},
                        status=status.HTTP_201_CREATED)

class LetterDetailView(generics.RetrieveAPIView):
    serializer_class = LetterSerializer
    lookup_field = "id"
    lookup_url_kwarg = "letter_id"
    def get_queryset(self):
        return Letter.objects.filter(status=Letter.Status.APPROVED).annotate(
            appreciation_count=Count("appreciations", distinct=True)
        )

@api_view(["GET"])
def random_letter(request):
    letter = Letter.objects.filter(status=Letter.Status.APPROVED).order_by("?").first()
    if not letter:
        return Response({"detail": "No letters are published yet."}, status=404)
    letter = Letter.objects.filter(pk=letter.pk).annotate(appreciation_count=Count("appreciations")).first()
    return Response(LetterSerializer(letter).data)

@api_view(["GET"])
def featured_letters(request):
    qs = Letter.objects.filter(status=Letter.Status.APPROVED, is_featured=True).annotate(
        appreciation_count=Count("appreciations", distinct=True)
    )[:6]
    if not qs:
        qs = Letter.objects.filter(status=Letter.Status.APPROVED).annotate(
            appreciation_count=Count("appreciations", distinct=True)
        )[:6]
    return Response(LetterSerializer(qs, many=True).data)

@api_view(["GET"])
def emotions(request):
    return Response([{"value": value, "label": label} for value, label in EMOTIONS])

@api_view(["POST"])
@throttle_classes([AnonRateThrottle])
def appreciate(request, letter_id):
    letter = get_object_or_404(Letter, id=letter_id, status=Letter.Status.APPROVED)
    token = request.headers.get("X-Anonymous-Token")
    if not token:
        return Response({"detail": "A browser token is required."}, status=400)
    hashed = hashlib.sha256(token.encode()).hexdigest()
    _, created = Appreciation.objects.get_or_create(letter=letter, token_hash=hashed)
    return Response({"appreciated": True, "created": created,
                     "count": letter.appreciations.count()})

class ReportCreateView(generics.CreateAPIView):
    serializer_class = ReportSerializer
    throttle_classes = [AnonRateThrottle]

@api_view(["GET"])
def health(request):
    return Response({"status": "ok", "service": "After the Draft API"})

