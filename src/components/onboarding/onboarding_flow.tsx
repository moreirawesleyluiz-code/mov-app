"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { MovAppWelcomeBackdrop } from "@/components/auth/auth-screen";
import {
  clearRegisterCallbackStorage,
  getRegisterCallbackAfterOnboarding,
  ONBOARDING_SIGNUP_INTENT,
  persistRegisterCallbackFromSearch,
} from "@/lib/onboarding-signup-intent";
import { ONBOARDING_STEPS } from "./onboarding-config";
import {
  clearOnboardingState,
  loadOnboardingState,
  saveOnboardingState,
  shouldOfferResume,
} from "./onboarding-persistence";
import type { OnboardingPersistedState } from "./onboarding-types";
import {
  BirthdayStepView,
  CitySearchModal,
  InterstitialStepView,
  MovWelcomeLogo,
  OnboardingLocationShell,
  OnboardingResumeModal,
  OnboardingWelcome,
  QuestionStepView,
  ScaleStepView,
} from "./onboarding-views";

function emptyState(): OnboardingPersistedState {
  return {
    v: 5,
    stepIndex: 0,
    answers: {},
    city: { id: "sp", name: "São Paulo" },
    updatedAt: new Date().toISOString(),
  };
}

/** Fallback com o mesmo “chassis” visual do welcome enquanto `useSearchParams` hidrata na navegação cliente. */
function OnboardingFlowSearchParamsFallback() {
  return (
    <MovAppWelcomeBackdrop>
      <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-5 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-[max(2.5rem,env(safe-area-inset-top))] sm:px-6">
        <MovWelcomeLogo />
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
          <p className="text-[15px] text-movApp-muted">Carregando…</p>
        </div>
      </div>
    </MovAppWelcomeBackdrop>
  );
}

/** Após a última pergunta, envia para o cadastro com o `callbackUrl` acordado (sessionStorage). */
function RegisterAfterOnboardingRedirect() {
  const router = useRouter();
  useEffect(() => {
    const cb = getRegisterCallbackAfterOnboarding();
    clearRegisterCallbackStorage();
    router.replace(`/register?callbackUrl=${encodeURIComponent(cb)}`);
  }, [router]);
  return (
    <MovAppWelcomeBackdrop>
      <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6">
        <p className="text-[15px] text-movApp-muted">A redirecionar…</p>
      </div>
    </MovAppWelcomeBackdrop>
  );
}

function OnboardingFlowInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const signupIntentProcessedKey = useRef<string | null>(null);

  const [flowActive, setFlowActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [city, setCity] = useState<{ id: string; name: string } | null>({ id: "sp", name: "São Paulo" });
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [cityQuery, setCityQuery] = useState("");

  const totalSteps = ONBOARDING_STEPS.length;
  const maxStepIndex = totalSteps - 1;
  const effectiveStepIndex = Math.min(stepIndex, maxStepIndex);

  useEffect(() => {
    if (flowActive && stepIndex > maxStepIndex) {
      setStepIndex(maxStepIndex);
    }
  }, [flowActive, stepIndex, maxStepIndex]);

  const currentStep = ONBOARDING_STEPS[effectiveStepIndex];

  useEffect(() => {
    if (searchParams.get("step") === "location") {
      setFlowActive(true);
      setStepIndex(0);
      setCity({ id: "sp", name: "São Paulo" });
      router.replace("/");
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (!flowActive) return;
    const payload: OnboardingPersistedState = {
      v: 5,
      stepIndex,
      answers,
      city,
      updatedAt: new Date().toISOString(),
    };
    saveOnboardingState(payload);
  }, [flowActive, stepIndex, answers, city]);

  const startFresh = useCallback(() => {
    clearOnboardingState();
    setAnswers({});
    setCity({ id: "sp", name: "São Paulo" });
    setStepIndex(0);
    setFlowActive(true);
    setShowResumeModal(false);
    saveOnboardingState(emptyState());
  }, []);

  const handleWelcomeStart = useCallback(() => {
    const saved = loadOnboardingState();
    if (saved && shouldOfferResume(saved)) {
      setShowResumeModal(true);
      return;
    }
    startFresh();
  }, [startFresh]);

  /** "Criar conta" / links externos: mesma lógica que "Começar" (retomar ou novo fluxo). */
  useEffect(() => {
    if (searchParams.get("intent") !== ONBOARDING_SIGNUP_INTENT) {
      signupIntentProcessedKey.current = null;
      return;
    }
    const q = searchParams.toString();
    if (signupIntentProcessedKey.current === q) return;
    signupIntentProcessedKey.current = q;

    persistRegisterCallbackFromSearch(searchParams.get("callbackUrl"));
    const saved = loadOnboardingState();
    if (saved && shouldOfferResume(saved)) {
      setShowResumeModal(true);
    } else {
      startFresh();
    }
    router.replace("/");
  }, [searchParams, router, startFresh]);

  const handleResumeContinue = useCallback(() => {
    const saved = loadOnboardingState();
    if (!saved) {
      setShowResumeModal(false);
      return;
    }
    setStepIndex(Math.min(saved.stepIndex, maxStepIndex));
    setAnswers(saved.answers);
    setCity(saved.city || { id: "sp", name: "São Paulo" });
    setFlowActive(true);
    setShowResumeModal(false);
  }, [maxStepIndex]);

  const handleResumeRestart = useCallback(() => {
    clearOnboardingState();
    setShowResumeModal(false);
    setStepIndex(0);
    setAnswers({});
    setCity({ id: "sp", name: "São Paulo" });
    setFlowActive(false);
  }, []);

  const advance = useCallback(() => {
    setStepIndex((i) => Math.min(i + 1, maxStepIndex));
  }, [maxStepIndex]);

  const handleLocationContinue = useCallback(() => {
    setAnswers((a) => ({ ...a, location: city?.id || "sp" }));
    advance();
  }, [city, advance]);

  const handleSingleSelect = useCallback(
    (value: string) => {
      const step = ONBOARDING_STEPS[effectiveStepIndex];
      if (!step || step.kind !== "single") return;
      setAnswers((a) => ({ ...a, [step.id]: value }));
      advance();
    },
    [effectiveStepIndex, advance],
  );

  const handleScaleSelect = useCallback(
    (value: string) => {
      const step = ONBOARDING_STEPS[effectiveStepIndex];
      if (!step || step.kind !== "scale") return;
      setAnswers((a) => ({ ...a, [step.id]: value }));
      advance();
    },
    [effectiveStepIndex, advance],
  );

  const handleBirthdayConfirm = useCallback(
    (isoDate: string) => {
      const step = ONBOARDING_STEPS[effectiveStepIndex];
      if (!step || step.kind !== "birthday") return;
      setAnswers((a) => ({ ...a, [step.id]: isoDate }));
      advance();
    },
    [effectiveStepIndex, advance],
  );

  const handleInterstitialNext = useCallback(() => {
    const step = ONBOARDING_STEPS[effectiveStepIndex];
    if (!step || step.kind !== "interstitial") return;
    advance();
  }, [effectiveStepIndex, advance]);

  const handleBack = useCallback(() => {
    const cur = Math.min(stepIndex, maxStepIndex);
    if (cur <= 0) {
      setFlowActive(false);
      return;
    }
    setStepIndex(cur - 1);
  }, [stepIndex, maxStepIndex]);

  return (
    <div className="min-h-[100dvh] bg-movApp-bg text-movApp-ink [color-scheme:light]">
      {!flowActive && (
        <>
          <OnboardingWelcome onStart={handleWelcomeStart} />
          {showResumeModal && (
            <OnboardingResumeModal
              onClose={() => setShowResumeModal(false)}
              onContinue={handleResumeContinue}
              onRestart={handleResumeRestart}
            />
          )}
        </>
      )}

      {flowActive && currentStep?.kind === "location" && (
        <>
          <OnboardingLocationShell
            onBack={() => setFlowActive(false)}
            onContinue={handleLocationContinue}
            onOpenCityModal={() => {
              setCityQuery("");
              setShowCityModal(true);
            }}
          />
          <CitySearchModal
            open={showCityModal}
            query={cityQuery}
            onQueryChange={setCityQuery}
            onPickCity={(id, name) => {
              setCity({ id, name });
              setShowCityModal(false);
            }}
            onClose={() => setShowCityModal(false)}
          />
        </>
      )}

      {flowActive && currentStep?.kind === "single" && (
        <QuestionStepView
          step={currentStep}
          selectedValue={answers[currentStep.id]}
          onSelect={handleSingleSelect}
          onBack={handleBack}
        />
      )}

      {flowActive && currentStep?.kind === "scale" && (
        <ScaleStepView
          step={currentStep}
          selectedValue={answers[currentStep.id]}
          onSelect={handleScaleSelect}
          onBack={handleBack}
        />
      )}

      {flowActive && currentStep?.kind === "interstitial" && currentStep.interstitialVariant && (
        <InterstitialStepView
          variant={currentStep.interstitialVariant}
          onNext={handleInterstitialNext}
          onBack={handleBack}
        />
      )}

      {flowActive && currentStep?.kind === "birthday" && (
        <BirthdayStepView
          step={currentStep}
          value={answers[currentStep.id]}
          onConfirm={handleBirthdayConfirm}
          onBack={handleBack}
        />
      )}

      {flowActive && currentStep?.kind === "auth" && <RegisterAfterOnboardingRedirect />}
    </div>
  );
}

export function OnboardingFlow() {
  return (
    <Suspense fallback={<OnboardingFlowSearchParamsFallback />}>
      <OnboardingFlowInner />
    </Suspense>
  );
}
