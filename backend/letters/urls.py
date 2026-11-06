from django.urls import path
from . import views

urlpatterns = [
    path("health/", views.health),
    path("letters/", views.LetterListView.as_view()),
    path("letters/submit/", views.LetterCreateView.as_view()),
    path("letters/random/", views.random_letter),
    path("letters/featured/", views.featured_letters),
    path("letters/<uuid:letter_id>/", views.LetterDetailView.as_view()),
    path("letters/<uuid:letter_id>/appreciate/", views.appreciate),
    path("emotions/", views.emotions),
    path("reports/", views.ReportCreateView.as_view()),
]
