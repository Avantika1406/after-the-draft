from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from letters.models import Letter

SAMPLES = [
    ("To the version of me who stayed", "I hope you know that staying soft in a world that kept asking you to harden was its own kind of courage. You did not lose by caring. You were simply learning where your tenderness belonged.", "hope"),
    ("I still remember the little things", "The way you laughed before finishing a sentence. The extra cup you made without asking. Ordinary moments have a way of becoming the ones we carry the longest.", "gratitude"),
    ("A goodbye I kept postponing", "I thought if I waited long enough, the right words would arrive. They never did. So this is me leaving the light on for the memory, while finally learning to walk forward.", "goodbye"),
    ("If I could begin again", "I would listen more carefully, speak more gently, and stop assuming that there would always be another tomorrow. I cannot change what happened, but I can let it teach me.", "regret"),
    ("For the person I never told", "Somewhere between the ordinary days, you became my favourite thought. I never needed an answer. I only wish I had been brave enough to let the truth exist outside my head.", "love"),
    ("For what is no longer here", "There are days when the smallest things bring you back. A song through a window, a familiar smell, the quiet at the end of the day. I am learning that missing you and living can happen together.", "grief"),
]
class Command(BaseCommand):
    help = "Create fictional sample letters for local development."
    def handle(self, *args, **options):
        for i, (title, body, emotion) in enumerate(SAMPLES):
            Letter.objects.get_or_create(
                title=title,
                defaults={"body": body, "emotion": emotion, "status": "approved",
                          "published_at": timezone.now() - timedelta(days=i+1), "is_featured": i < 3}
            )
        self.stdout.write(self.style.SUCCESS("Added fictional demo letters (existing titles were left unchanged)."))
