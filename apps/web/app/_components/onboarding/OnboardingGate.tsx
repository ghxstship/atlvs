"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import type { Session } from "@supabase/supabase-js";
import { Button } from "@ghxstship/ui/components/atomic/Button";
import { Badge } from "@ghxstship/ui/components/Badge";
import { Progress } from "@ghxstship/ui/components/Progress";
import { Modal } from "@ghxstship/ui/components/Modal";
import { Badge, Button, useLocalStorage } from '@ghxstship/ui';
import { Sparkles, Clock } from "lucide-react";

import { VerifyEmailStep } from "../../auth/onboarding/steps/VerifyEmailStep";
import { PlanSelectionStep } from "../../auth/onboarding/steps/PlanSelectionStep";
import { OrganizationSetupStep } from "../../auth/onboarding/steps/OrganizationSetupStep";
import { TeamInvitationStep } from "../../auth/onboarding/steps/TeamInvitationStep";
import { ProfileCompletionStep } from "../../auth/onboarding/steps/ProfileCompletionStep";
import { FinalConfirmationStep } from "../../auth/onboarding/steps/FinalConfirmationStep";

const STORAGE_KEY_STATUS = "atlvs:onboarding-status";
const STORAGE_KEY_STEP = `${STORAGE_KEY_STATUS}:step`;
const STORAGE_KEY_DATA = `${STORAGE_KEY_STATUS}:data`;

type OnboardingStatus = "not-started" | "in-progress" | "completed" | "deferred";
type OnboardingData = Record<string, unknown>;

const STEP_ORDER = [
  "verify-email",
  "plan-selection",
  "organization-setup",
  "team-invitation",
  "profile-completion",
  "final-confirmation",
] as const;

type StepId = typeof STEP_ORDER[number];

const STEP_LABELS: Record<StepId, string> = {
  "verify-email": "Verify your email",
  "plan-selection": "Choose your plan",
  "organization-setup": "Set up your organization",
  "team-invitation": "Invite your team",
  "profile-completion": "Complete your profile",
  "final-confirmation": "Finalize setup"
};

export function OnboardingGate() {
  const router = useRouter();
  const supabase = React.useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
      ),
    []
  );

  const [status, setStatus] = useLocalStorage<OnboardingStatus>(STORAGE_KEY_STATUS, "not-started");
  const [currentStepIndex, setCurrentStepIndex] = React.useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const stored = window.localStorage.getItem(STORAGE_KEY_STEP);
    const parsed = stored ? Number(stored) : 0;
    if (Number.isNaN(parsed)) return 0;
    return Math.min(Math.max(parsed, 0), STEP_ORDER.length - 1);
  });
  const [onboardingData, setOnboardingData] = React.useState<OnboardingData>(() => {
    if (typeof window === "undefined") return {};
    const stored = window.localStorage.getItem(STORAGE_KEY_DATA);
    if (!stored) return {};
    try {
      return JSON.parse(stored) as OnboardingData;
    } catch (error) {
      console.warn("Failed to parse onboarding data", error);
      return {};
    }
  });
  const [user, setUser] = React.useState<Session["user"] | null>(null);
  const [initializing, setInitializing] = React.useState(true);
  const [modalOpen, setModalOpen] = React.useState(false);

  const persistStep = React.useCallback((index: number) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY_STEP, String(index));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistData = React.useCallback((data: OnboardingData) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(data));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetPersisted = React.useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY_STEP);
      window.localStorage.removeItem(STORAGE_KEY_DATA);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateData = React.useCallback((patch: OnboardingData) => {
    setOnboardingData((prev) => {
      const next = { ...prev, ...patch };
      persistData(next);
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persistData]);

  const handleStart = React.useCallback(() => {
    setStatus("in-progress");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setStatus]);

  const handleCompleteLater = React.useCallback(() => {
    setStatus("deferred");
    setModalOpen(false);
    router.refresh();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, setStatus]);

  const handleResume = React.useCallback(() => {
    setStatus("in-progress");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setStatus]);

  const handleNext = React.useCallback(() => {
    setCurrentStepIndex((prev) => {
      const next = Math.min(prev + 1, STEP_ORDER.length - 1);
      persistStep(next);
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persistStep]);

  const handleBack = React.useCallback(() => {
    setCurrentStepIndex((prev) => {
      const next = Math.max(prev - 1, 0);
      persistStep(next);
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persistStep]);

  const handleComplete = React.useCallback(() => {
    setStatus("completed");
    setCurrentStepIndex(0);
    resetPersisted();
    setModalOpen(false);
    router.refresh();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetPersisted, router, setStatus]);

  React.useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (cancelled) return;
        const sessionUser = data.session?.user ?? null;
        setUser(sessionUser);

        if (sessionUser) {
          const { data: profiles } = await supabase
            .from("user_profiles")
            .select("onboarding_completed, onboarding_completed_at")
            .eq("user_id", sessionUser.id)
            .limit(1);

          const completed = Boolean(profiles?.[0]?.onboarding_completed);
          if (completed) {
            setStatus("completed");
            setCurrentStepIndex(0);
            resetPersisted();
          }
        }
      } catch (error) {
        console.warn("Failed to initialize onboarding gate", error);
      } finally {
        if (!cancelled) {
          setInitializing(false);
        }
      }
    };

    initialize();
    return () => {
      cancelled = true;
    };
  }, [resetPersisted, setStatus, supabase]);

  React.useEffect(() => {
    setModalOpen(status === "in-progress");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const currentStepId = STEP_ORDER[currentStepIndex];
  const progress = ((currentStepIndex + 1) / STEP_ORDER.length) * 100;
  const showBanner = status === "not-started" && !initializing;
  const readOnly = status === "deferred";

  const verifyEmailUser = React.useMemo(() => {
    if (!user) return null;
    return {
      id: user.id,
      email: user.email ?? "",
      email_confirmed_at: user.email_confirmed_at ?? undefined
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const renderStep = () => {
    if (!user) {
      return (
        <div className="flex flex-col items-center justify-center gap-sm py-2xl text-center text-muted-foreground">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p>Loading your profile…</p>
        </div>
      );
    }

    switch (currentStepId) {
      case "verify-email":
        return (
          <VerifyEmailStep
            user={verifyEmailUser!}
            onNext={handleNext}
            updateData={updateData}
          />
        );
      case "plan-selection":
        return (
          <PlanSelectionStep
            data={onboardingData}
            updateData={updateData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case "organization-setup":
        return (
          <OrganizationSetupStep
            user={user}
            data={onboardingData}
            updateData={updateData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case "team-invitation":
        return (
          <TeamInvitationStep
            user={user}
            data={onboardingData}
            updateData={updateData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case "profile-completion":
        return (
          <ProfileCompletionStep
            user={user}
            data={onboardingData}
            updateData={updateData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case "final-confirmation":
        return (
          <FinalConfirmationStep
            user={user}
            data={onboardingData}
            onComplete={handleComplete}
          />
        );
      default:
        return null;
    }
  };

  if (initializing || status === "completed") {
    return null;
  }

  return (
    <>
      {showBanner ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-background/70 backdrop-blur-xl px-md">
          <div className="w-full max-w-3xl rounded-2xl border border-border/40 bg-background/80 shadow-elevated px-5xl py-4xl flex flex-col gap-lg text-center">
            <div className="flex justify-center">
              <Badge variant="secondary" className="gap-xs px-md py-xs">
                <Sparkles className="h-icon-xs w-icon-xs text-primary" />
                Complete your profile to unlock ATLVS automation
              </Badge>
            </div>
            <h2 className="text-display-sm font-semibold text-foreground tracking-tight">Complete your profile to personalize your workspace</h2>
            <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto">
              We tailor navigation, dashboards, and project recommendations based on your profile. This takes less than five minutes and helps unlock automation, staffing suggestions, and AI copilots tuned to your role.
            </p>
            <div className="flex flex-wrap justify-center gap-sm">
              <Button size="lg" onClick={handleStart}>
                Start profile onboarding
              </Button>
              <Button size="lg" variant="ghost" onClick={handleCompleteLater}>
                Complete later
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <Modal
        open={modalOpen}
        onClose={() => {
          if (status === "deferred") {
            setModalOpen(false);
            return;
          }
          setModalOpen(true);
        }}
        size="5xl"
        blur="lg"
        showCloseButton={false}
        overlayClassName="z-[95]"
        className="bg-background/95"
      >
        <div className="flex flex-col gap-xl">
          <header className="flex flex-wrap items-start justify-between gap-sm">
            <div className="flex flex-col gap-xs">
              <Badge variant="secondary" className="w-max gap-xs">
                <Sparkles className="h-icon-xs w-icon-xs" />
                {STEP_LABELS[currentStepId]}
              </Badge>
              <h2 className="text-heading-2 font-semibold">Finish setting up your workspace</h2>
              <p className="text-body-md text-muted-foreground max-w-prose">
                Progress is saved automatically. You can resume later, but completing now unlocks personalized navigation, staffing automation, and AI copilots tuned to your role.
              </p>
            </div>
            <div className="flex flex-col items-end gap-xs text-right">
              <span className="text-xs uppercase text-muted-foreground">Progress</span>
              <div className="mt-xs w-40">
                <Progress value={progress} />
              </div>
              <span className="text-xs text-muted-foreground">
                Step {currentStepIndex + 1} of {STEP_ORDER.length}
              </span>
              <Button variant="ghost" size="sm" onClick={handleCompleteLater}>
                Complete later
              </Button>
            </div>
          </header>

          <section className="rounded-2xl border border-border/60 bg-card p-2xl shadow-floating">
            {renderStep()}
          </section>
        </div>
      </Modal>

      {readOnly ? (
        <div className="pointer-events-auto fixed inset-0 z-[85] flex items-center justify-center bg-background/85 backdrop-blur-xl px-md">
          <div className="max-w-lg rounded-2xl border border-border/40 bg-card/95 px-3xl py-2xl text-center shadow-floating">
            <div className="flex justify-center mb-sm">
              <Clock className="h-icon-md w-icon-md text-warning" />
            </div>
            <h2 className="text-heading-3 font-semibold text-foreground mb-xs">Read-only mode activated</h2>
            <p className="text-body-md text-muted-foreground mb-lg">
              You chose to finish onboarding later. Edit actions are paused until your profile is completed so permissions stay aligned. You can resume anytime.
            </p>
            <Button onClick={handleResume}>Resume profile completion</Button>
          </div>
        </div>
      ) : null}
    </>
  );
}
