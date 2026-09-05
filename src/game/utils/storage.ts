import type { GameState } from '../types/game';
import { SAVE_KEY } from '../../config/constants';

export function saveGame(state: GameState): void {
  try {
    const data = JSON.stringify({ version: 1, state });
    localStorage.setItem(SAVE_KEY, data);
  } catch (e) {
    console.warn('Failed to save game:', e);
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { version: number; state: GameState };
    if (parsed.version !== 1) return null;
    return parsed.state;
  } catch (e) {
    console.warn('Failed to load game:', e);
    return null;
  }
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY);
}
