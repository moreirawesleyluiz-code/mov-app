/**
 * Persistência local do onboarding — chave versionada para evoluir sem quebrar migrações futuras.
 * Não usa mais mov_onboarding_complete_v1: o acesso ao app é só após cadastro/login (fora deste módulo).
 */

import type { OnboardingPersistedState } from "./onboarding-types";

export const ONBOARDING_STORAGE_KEY = "mov_onboarding_state_v4";

/** Removido do fluxo — ainda limpo do storage se existir (evita bypass antigo). */
const LEGACY_COMPLETE_KEY = "mov_onboarding_complete_v1";
const LEGACY_PROGRESS_KEY = "mov_onboarding_progress_v1";
const LEGACY_CITY_KEY = "mov_onboarding_city_v1";
const PREVIOUS_STATE_V2_KEY = "mov_onboarding_state_v2";
const PREVIOUS_STATE_V3_KEY = "mov_onboarding_state_v3";

function discardObsoleteStateKeys(): void {
  try {
    localStorage.removeItem(PREVIOUS_STATE_V2_KEY);
    localStorage.removeItem(PREVIOUS_STATE_V3_KEY);
    localStorage.removeItem(LEGACY_COMPLETE_KEY);
  } catch {
    /* ignore */
  }
}

export function loadOnboardingState(): OnboardingPersistedState | null {
  try {
    discardObsoleteStateKeys();
    const raw = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!raw) return tryMigrateFromLegacy();
    const p = JSON.parse(raw) as OnboardingPersistedState;
    if (p?.v !== 4) return null;
    return p;
  } catch {
    return null;
  }
}

function tryMigrateFromLegacy(): OnboardingPersistedState | null {
  try {
    const prog = localStorage.getItem(LEGACY_PROGRESS_KEY);
    if (!prog) return null;
    const cityRaw = localStorage.getItem(LEGACY_CITY_KEY);
    let city: { id: string; name: string } | null = { id: "sp", name: "São Paulo" };
    if (cityRaw) {
      const c = JSON.parse(cityRaw) as { id?: string; name?: string };
      if (c?.id && c?.name) city = { id: c.id, name: c.name };
    }
    const migrated: OnboardingPersistedState = {
      v: 4,
      stepIndex: 0,
      answers: {},
      city,
      updatedAt: new Date().toISOString(),
    };
    saveOnboardingState(migrated);
    localStorage.removeItem(LEGACY_PROGRESS_KEY);
    return migrated;
  } catch {
    return null;
  }
}

export function saveOnboardingState(state: OnboardingPersistedState): void {
  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function clearOnboardingState(): void {
  try {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    localStorage.removeItem(LEGACY_PROGRESS_KEY);
    localStorage.removeItem(PREVIOUS_STATE_V2_KEY);
    localStorage.removeItem(PREVIOUS_STATE_V3_KEY);
    localStorage.removeItem(LEGACY_COMPLETE_KEY);
  } catch {
    /* ignore */
  }
}

/** Limpa estado local do questionário; não marca “completo” nem concede acesso ao app. */
export function markOnboardingFinished(): void {
  clearOnboardingState();
}
