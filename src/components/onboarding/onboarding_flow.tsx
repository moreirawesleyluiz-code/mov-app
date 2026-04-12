"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ONBOARDING_STEPS } from "./onboarding-config";
import { clearOnboardingState, loadOnboardingState, saveOnboardingState } from "./onboarding-persistence";
import type { OnboardingPersistedState } from "./onboarding-types";
import {
  AuthHandoffView,
  BirthdayStepView,
  CitySearchModal,
  CountryStepView,
  InterstitialStepView,
  OnboardingLocationShell,
  OnboardingResumeModal,
  OnboardingWelcome,
  QuestionStepView,
  ScaleStepView,
} from "./onboarding-views";

function emptyState(): OnboardingPersistedState {
  return {
    v: 4,
    stepIndex: 0,
    answers: {},
    city: { id: "sp", name: "São Paulo" },
    updatedAt: new Date().toISOString(),
  };
}

export function OnboardingFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();

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
    const saved = loadOnboardingState();
    if (saved && (saved.stepIndex > 0 || Object.keys(saved.answers).length > 0)) {
      setShowResumeModal(true);
    }
  }, []);

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
      v: 4,
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
    if (saved && (saved.stepIndex > 0 || Object.keys(saved.answers).length > 0)) {
      setShowResumeModal(true);
      return;
    }
    startFresh();
  }, [startFresh]);

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

  const handleCountryConfirm = useCallback(
    (countryCode: string) => {
      const step = ONBOARDING_STEPS[effectiveStepIndex];
      if (!step || step.kind !== "country") return;
      setAnswers((a) => ({ ...a, [step.id]: countryCode }));
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
            cityName={city?.name || "São Paulo"}
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
          stepIndex={effectiveStepIndex}
          totalSteps={totalSteps}
          selectedValue={answers[currentStep.id]}
          onSelect={handleSingleSelect}
          onBack={handleBack}
        />
      )}

      {flowActive && currentStep?.kind === "scale" && (
        <ScaleStepView
          step={currentStep}
          stepIndex={effectiveStepIndex}
          totalSteps={totalSteps}
          selectedValue={answers[currentStep.id]}
          onSelect={handleScaleSelect}
          onBack={handleBack}
        />
      )}

      {flowActive && currentStep?.kind === "interstitial" && currentStep.interstitialVariant && (
        <InterstitialStepView
          variant={currentStep.interstitialVariant}
          stepIndex={effectiveStepIndex}
          totalSteps={totalSteps}
          section={currentStep.section}
          onNext={handleInterstitialNext}
          onBack={handleBack}
        />
      )}

      {flowActive && currentStep?.kind === "country" && (
        <CountryStepView
          step={currentStep}
          stepIndex={effectiveStepIndex}
          totalSteps={totalSteps}
          value={answers[currentStep.id]}
          onConfirm={handleCountryConfirm}
          onBack={handleBack}
        />
      )}

      {flowActive && currentStep?.kind === "birthday" && (
        <BirthdayStepView
          step={currentStep}
          stepIndex={effectiveStepIndex}
          totalSteps={totalSteps}
          value={answers[currentStep.id]}
          onConfirm={handleBirthdayConfirm}
          onBack={handleBack}
        />
      )}

      {flowActive && currentStep?.kind === "auth" && (
        <AuthHandoffView
          step={currentStep}
          stepIndex={effectiveStepIndex}
          totalSteps={totalSteps}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
