import type { Resources } from '../types/game';
import { RESOURCE_LIMITS } from '../../config/constants';

export function clampResources(r: Resources): Resources {
  return {
    money: Math.max(0, Math.min(RESOURCE_LIMITS.money, Math.round(r.money))),
    admin: Math.max(0, Math.min(RESOURCE_LIMITS.admin, Math.round(r.admin))),
    discontent: Math.max(0, Math.min(RESOURCE_LIMITS.discontent, Math.round(r.discontent))),
    security: Math.max(0, Math.min(RESOURCE_LIMITS.security, Math.round(r.security))),
    loyalty: Math.max(0, Math.min(RESOURCE_LIMITS.loyalty, Math.round(r.loyalty))),
  };
}

export function adjustResources(r: Resources, delta: Partial<Resources>): Resources {
  return clampResources({
    money: r.money + (delta.money ?? 0),
    admin: r.admin + (delta.admin ?? 0),
    discontent: r.discontent + (delta.discontent ?? 0),
    security: r.security + (delta.security ?? 0),
    loyalty: r.loyalty + (delta.loyalty ?? 0),
  });
}

// Critical thresholds trigger game over.
export function checkGameOver(r: Resources): { over: boolean; reason?: string } {
  if (r.discontent >= 95) return { over: true, reason: 'Недовольство достигло предела. Отдел расформирован.' };
  if (r.security <= 5) return { over: true, reason: 'Безопасность отдела рухнула. Начались проверки.' };
  if (r.loyalty <= 5) return { over: true, reason: 'Начальство сняло вас с должности.' };
  return { over: false };
}
