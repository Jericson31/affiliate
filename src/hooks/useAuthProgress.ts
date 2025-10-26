import { useState, useCallback } from 'react';
import type { AuthStep } from '@/components/auth/AuthProgressScreen';

export type AuthProgressCallback = (steps: AuthStep[]) => void;

export const useAuthProgress = () => {
  const [steps, setSteps] = useState<AuthStep[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const initializeSignUpSteps = useCallback(() => {
    const signUpSteps: AuthStep[] = [
      { id: 'create-account', label: 'Creating account with Supabase Auth', status: 'pending' },
      { id: 'establish-session', label: 'Establishing secure session', status: 'pending' },
      { id: 'create-profile', label: 'Creating user profile in database', status: 'pending' },
      { id: 'generate-affiliate', label: 'Generating affiliate record', status: 'pending' },
      { id: 'setup-partnership', label: 'Setting up partnership code', status: 'pending' },
      { id: 'finalize-auth', label: 'Finalizing authentication', status: 'pending' },
      { id: 'redirect', label: 'Redirecting to dashboard', status: 'pending' },
    ];
    setSteps(signUpSteps);
    setIsVisible(true);
  }, []);

  const initializeSignInSteps = useCallback(() => {
    const signInSteps: AuthStep[] = [
      { id: 'verify-credentials', label: 'Verifying credentials', status: 'pending' },
      { id: 'validate-auth', label: 'Authenticating with Supabase', status: 'pending' },
      { id: 'establish-session', label: 'Establishing secure session', status: 'pending' },
      { id: 'redirect', label: 'Redirecting to dashboard', status: 'pending' },
    ];
    setSteps(signInSteps);
    setIsVisible(true);
  }, []);

  const updateStepStatus = useCallback(
    (stepId: string, status: AuthStep['status'], errorMessage?: string) => {
      setSteps((prevSteps) =>
        prevSteps.map((step) =>
          step.id === stepId ? { ...step, status, errorMessage } : step
        )
      );
    },
    []
  );

  const startStep = useCallback(
    (stepId: string) => {
      setSteps((prevSteps) =>
        prevSteps.map((step) =>
          step.id === stepId ? { ...step, status: 'in_progress' as const, startTime: Date.now() } : step
        )
      );
    },
    []
  );

  const completeStep = useCallback(
    (stepId: string) => {
      setSteps((prevSteps) =>
        prevSteps.map((step) =>
          step.id === stepId ? { ...step, status: 'completed' as const, endTime: Date.now() } : step
        )
      );
    },
    []
  );

  const failStep = useCallback(
    (stepId: string, errorMessage: string) => {
      updateStepStatus(stepId, 'error', errorMessage);
    },
    [updateStepStatus]
  );

  const reset = useCallback(() => {
    setSteps([]);
    setIsVisible(false);
  }, []);

  const hide = useCallback(() => {
    setIsVisible(false);
  }, []);

  return {
    steps,
    isVisible,
    initializeSignUpSteps,
    initializeSignInSteps,
    startStep,
    completeStep,
    failStep,
    reset,
    hide,
  };
};
