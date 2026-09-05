import type { GameEvent } from '../types/game';

function pct(n: number, ctx: { min: number; max: number }): number {
  return Math.max(ctx.min, Math.min(ctx.max, n));
}

export const EVENTS: GameEvent[] = [
  {
    id: 'plan_increase',
    title: 'НАЧАЛЬСТВО УВЕЛИЧИЛО ПЛАН',
    text: 'Телеграмма из области. План пересмотрен в большую сторону.',
    condition: (s) => s.day >= 3,
    choices: [
      {
        label: 'Принять (+2 к плану)',
        description: 'Дисциплина прежде всего.',
        apply: (s) => {
          s.plan += 2;
          s.resources.loyalty += 4;
          s.resources.discontent += 3;
        },
      },
      {
        label: 'Согласовать пересмотр (−2 к плану, −5 лояльности)',
        apply: (s) => {
          s.plan = Math.max(1, s.plan - 2);
          s.resources.loyalty = pct(s.resources.loyalty - 5, { min: 0, max: 100 });
        },
      },
    ],
  },
  {
    id: 'rumors',
    title: 'РАСПРОСТРАНЯЮТСЯ СЛУХИ',
    text: 'По району ходят нехорошие разговоры. Нужно реагировать.',
    choices: [
      {
        label: 'Запустить опровержение (−₽80, −4 недовольства)',
        apply: (s) => {
          s.resources.money = Math.max(0, s.resources.money - 80);
          s.resources.discontent = pct(s.resources.discontent - 4, { min: 0, max: 100 });
        },
      },
      {
        label: 'Не обращать внимания (+6 недовольства)',
        apply: (s) => {
          s.resources.discontent = pct(s.resources.discontent + 6, { min: 0, max: 100 });
        },
      },
    ],
  },
  {
    id: 'doc_error',
    title: 'ОШИБКА В ДОКУМЕНТАХ',
    text: 'В отделе найдена ошибка в одной из папок. Ревизия на носу.',
    choices: [
      {
        label: 'Срочно исправить (−₽120, +6 безопасности)',
        apply: (s) => {
          s.resources.money = Math.max(0, s.resources.money - 120);
          s.resources.security = pct(s.resources.security + 6, { min: 0, max: 100 });
        },
      },
      {
        label: 'Закрыть глаза (−8 безопасности)',
        apply: (s) => {
          s.resources.security = pct(s.resources.security - 8, { min: 0, max: 100 });
        },
      },
    ],
  },
  {
    id: 'inspection',
    title: 'ПРИШЛА ПРОВЕРКА',
    text: 'Комиссия из управления. Нужно показать, что отдел работает.',
    condition: (s) => s.resources.loyalty < 65,
    choices: [
      {
        label: 'Принять с размахом (−₽200, +10 лояльности)',
        apply: (s) => {
          s.resources.money = Math.max(0, s.resources.money - 200);
          s.resources.loyalty = pct(s.resources.loyalty + 10, { min: 0, max: 100 });
        },
      },
      {
        label: 'Отделаться формально (+4 безопасности, −5 лояльности)',
        apply: (s) => {
          s.resources.security = pct(s.resources.security + 4, { min: 0, max: 100 });
          s.resources.loyalty = pct(s.resources.loyalty - 5, { min: 0, max: 100 });
        },
      },
    ],
  },
  {
    id: 'extra_attendance',
    title: 'НЕОЖИДАННАЯ ЯВКА',
    text: 'Граждане пришли сами — слышали, что явка упростит формальности.',
    choices: [
      {
        label: 'Принять бонус (+2 бесплатных результата сегодня)',
        apply: (s) => {
          s.plan = Math.max(0, s.plan - 2);
        },
      },
      {
        label: 'Отпустить и не портить статистику (−2 недовольства, +3 лояльности)',
        apply: (s) => {
          s.resources.discontent = pct(s.resources.discontent - 2, { min: 0, max: 100 });
          s.resources.loyalty = pct(s.resources.loyalty + 3, { min: 0, max: 100 });
        },
      },
    ],
  },
  {
    id: 'scheme',
    title: 'СОТРУДНИК ПРЕДЛОЖИЛ СХЕМУ',
    text: 'Местный специалист предлагает «оптимизированный подход».',
    choices: [
      {
        label: 'Внедрить (−3 безопасности, +5 результата сегодня)',
        apply: (s) => {
          s.resources.security = pct(s.resources.security - 3, { min: 0, max: 100 });
          s.plan = Math.max(0, s.plan - 5);
        },
      },
      {
        label: 'Отказать (+2 безопасности)',
        apply: (s) => {
          s.resources.security = pct(s.resources.security + 2, { min: 0, max: 100 });
        },
      },
    ],
  },
  {
    id: 'city_unrest',
    title: 'ГОРОД ВОЛНУЕТСЯ',
    text: 'В центре собралась стихийная толпа. Ждут реакции.',
    condition: (s) => s.resources.discontent >= 35,
    choices: [
      {
        label: 'Разъяснительная работа (−₽60, −5 недовольства)',
        apply: (s) => {
          s.resources.money = Math.max(0, s.resources.money - 60);
          s.resources.discontent = pct(s.resources.discontent - 5, { min: 0, max: 100 });
        },
      },
      {
        label: 'Усилить присутствие (−8 безопасности)',
        apply: (s) => {
          s.resources.security = pct(s.resources.security - 8, { min: 0, max: 100 });
        },
      },
    ],
  },
  {
    id: 'volunteer',
    title: 'ПРИШЁЛ ДОБРОВОЛЕЦ',
    text: 'Гражданин сам выразил желание. Засчитать?',
    choices: [
      {
        label: 'Засчитать и доложить (+1 к плану сегодня, +3 лояльности)',
        apply: (s) => {
          s.plan += 1;
          s.resources.loyalty = pct(s.resources.loyalty + 3, { min: 0, max: 100 });
        },
      },
      {
        label: 'Отклонить (−2 недовольства)',
        apply: (s) => {
          s.resources.discontent = pct(s.resources.discontent - 2, { min: 0, max: 100 });
        },
      },
    ],
  },
  {
    id: 'extra_budget',
    title: 'ДОПОЛНИТЕЛЬНЫЙ БЮДЖЕТ',
    text: 'Из области пришли дополнительные средства на «оперативные нужды».',
    choices: [
      {
        label: 'Принять (+₽300, −3 лояльности)',
        apply: (s) => {
          s.resources.money += 300;
          s.resources.loyalty = pct(s.resources.loyalty - 3, { min: 0, max: 100 });
        },
      },
      {
        label: 'Отказаться (−₽−)',
        apply: () => {},
      },
    ],
  },
  {
    id: 'press_leak',
    title: 'УТЕЧКА В ПРЕССУ',
    text: 'Журналисты раскопали внутреннюю переписку.',
    condition: (s) => s.resources.security < 50,
    choices: [
      {
        label: 'Закрыть публикацию (−₽250, +5 безопасности)',
        apply: (s) => {
          s.resources.money = Math.max(0, s.resources.money - 250);
          s.resources.security = pct(s.resources.security + 5, { min: 0, max: 100 });
        },
      },
      {
        label: 'Игнорировать (+8 недовольства)',
        apply: (s) => {
          s.resources.discontent = pct(s.resources.discontent + 8, { min: 0, max: 100 });
        },
      },
    ],
  },
];
