export const COGNITIVE_DISTORTIONS = [
  { code: 'all_or_nothing', name: 'Чёрно-белое мышление' },
  { code: 'overgeneralization', name: 'Сверхобобщение' },
  { code: 'mental_filter', name: 'Ментальный фильтр' },
  { code: 'disqualifying_positive', name: 'Обесценивание позитива' },
  { code: 'mind_reading', name: 'Чтение мыслей' },
  { code: 'fortune_telling', name: 'Предсказание будущего' },
  { code: 'catastrophizing', name: 'Катастрофизация' },
  { code: 'emotional_reasoning', name: 'Эмоциональное рассуждение' },
  { code: 'should_statements', name: '«Должен» / «Обязан»' },
  { code: 'labeling', name: 'Навешивание ярлыков' },
  { code: 'personalization', name: 'Персонализация' },
  { code: 'magnification', name: 'Преувеличение' },
] as const;

export const TRIGGER_CATEGORIES = [
  'Межличностные',
  'Рабочие',
  'Самооценка',
  'Потеря контроля',
  'Отвержение',
  'Неудача',
  'Здоровье',
  'Другое',
] as const;

export const MOOD_LABELS: Record<number, string> = {
  1: 'Очень плохо',
  2: 'Плохо',
  3: 'Неплохо',
  4: 'Нормально',
  5: 'Средне',
  6: 'Хорошо',
  7: 'Хорошо',
  8: 'Очень хорошо',
  9: 'Отлично',
  10: 'Великолепно',
};

export const EMOTION_COLORS = [
  '#01696f',
  '#4f98a3',
  '#bb653b',
  '#6daa45',
  '#a86fdf',
  '#5591c7',
  '#e8af34',
  '#dd6974',
] as const;
