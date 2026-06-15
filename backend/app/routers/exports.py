"""Export weekly data as Markdown (for therapist sharing or offline archive)."""
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.deps import get_db, get_current_user
from app.models.user import User
from app.models.weekly_review import WeeklyReview
from app.models.daily_checkin import DailyCheckin
from app.models.thought_record import ThoughtRecord
from app.models.experiment import Experiment
from app.models.trigger_event import TriggerEvent

router = APIRouter()


@router.get("/week/{week_start}", response_class=PlainTextResponse)
async def export_week_markdown(
    week_start: date,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> str:
    week_end = week_start + timedelta(days=6)

    review = (await db.execute(
        select(WeeklyReview).where(
            WeeklyReview.user_id == user.id, WeeklyReview.week_start == week_start
        )
    )).scalar_one_or_none()

    checkins = (await db.execute(
        select(DailyCheckin).where(
            DailyCheckin.user_id == user.id,
            DailyCheckin.entry_date >= week_start,
            DailyCheckin.entry_date <= week_end,
        ).order_by(DailyCheckin.entry_date)
    )).scalars().all()

    thoughts = (await db.execute(
        select(ThoughtRecord).where(
            ThoughtRecord.user_id == user.id,
            ThoughtRecord.created_at >= week_start,
            ThoughtRecord.created_at <= week_end,
        )
    )).scalars().all()

    experiments = (await db.execute(
        select(Experiment).where(
            Experiment.user_id == user.id,
            Experiment.updated_at >= week_start,
            Experiment.updated_at <= week_end,
        )
    )).scalars().all()

    triggers = (await db.execute(
        select(TriggerEvent).where(
            TriggerEvent.user_id == user.id,
            TriggerEvent.created_at >= week_start,
            TriggerEvent.created_at <= week_end,
        )
    )).scalars().all()

    lines = [
        f"# MyLifeBook — Отчёт за неделю {week_start} — {week_end}",
        f"Пользователь: {user.display_name}",
        "",
    ]

    if review:
        lines += [
            "## Сводка",
            f"- Настроение (ср): {review.avg_mood:.1f}/10" if review.avg_mood else "",
            f"- Энергия (ср): {review.avg_energy:.1f}/10" if review.avg_energy else "",
            f"- Тревога (ср): {review.avg_anxiety:.1f}/10" if review.avg_anxiety else "",
            f"- Чекинов: {review.checkins_count}/7",
            f"- Старая схема: сработала {review.old_script_triggered_days} дн., устоял {review.old_script_resisted_days} дн.",
            "",
        ]
        if review.ai_insights:
            lines += ["## AI-анализ", review.ai_insights, ""]
        if review.ai_suggestions:
            lines.append("## Рекомендации")
            lines += [f"- {s}" for s in review.ai_suggestions]
            lines.append("")
        if review.user_reflection:
            lines += ["## Моя рефлексия", review.user_reflection, ""]
        if review.user_wins:
            lines += ["## Победы недели", review.user_wins, ""]
        if review.user_goals:
            lines += ["## Цели на следующую неделю", review.user_goals, ""]

    if checkins:
        lines.append("## Ежедневные чекины")
        for c in checkins:
            lines.append(
                f"**{c.entry_date}** — настроение {c.mood}, тревога {c.anxiety}, "
                f"схема: {'да' if c.old_script_triggered else 'нет'} / устоял: {'да' if c.old_script_resisted else 'нет'}"
            )
            if c.what_hurts:
                lines.append(f"  - Что болит: {c.what_hurts}")
            if c.what_was_good:
                lines.append(f"  - Хорошее: {c.what_was_good}")
        lines.append("")

    if thoughts:
        lines.append("## Записи мыслей")
        for t in thoughts:
            lines += [
                f"### {t.created_at.date()}",
                f"**Ситуация:** {t.situation}",
                f"**Автоматическая мысль:** {t.automatic_thought}",
            ]
            if t.alternative_thought:
                lines.append(f"**Альтернативная мысль:** {t.alternative_thought}")
            lines.append("")

    if triggers:
        lines.append("## Триггеры")
        for tr in triggers:
            lines.append(f"- [{tr.category or 'другое'}] {tr.description}")
        lines.append("")

    if experiments:
        lines.append("## Поведенческие эксперименты")
        for e in experiments:
            lines += [
                f"### {e.new_behavior}",
                f"Статус: {e.status}",
            ]
            if e.what_happened:
                lines.append(f"Что произошло: {e.what_happened}")
            if e.lesson_learned:
                lines.append(f"Вывод: {e.lesson_learned}")
            lines.append("")

    content = "\n".join(lines)
    filename = f"mylifebook_{week_start}.md"
    return PlainTextResponse(
        content=content,
        media_type="text/markdown; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
