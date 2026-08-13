import { useCallback, useState } from "react";

export type VerificationGateStatus =
  | "idle"
  | "passed"
  | "blocked";

interface UseFaceVerificationResult {
  status: VerificationGateStatus;
  canProceed: boolean;
  message: string;
  evaluateDetection: (faceCount: number) => void;
  resetVerification: () => void;
}

export function useFaceVerification(): UseFaceVerificationResult {
  const [status, setStatus] =
    useState<VerificationGateStatus>("idle");

  const [message, setMessage] = useState(
    "Face verification has not started.",
  );

  const evaluateDetection = useCallback(
    (faceCount: number) => {
      if (faceCount === 1) {
        setStatus("passed");

        setMessage(
          "Exactly one face was detected. The image can proceed to the identity-verification stage.",
        );

        return;
      }

      if (faceCount === 0) {
        setStatus("blocked");

        setMessage(
          "No face was detected. A new photo is required.",
        );

        return;
      }

      setStatus("blocked");

      setMessage(
        `Multiple faces were detected (${faceCount}). Only one person should be visible.`,
      );
    },
    [],
  );

  const resetVerification = useCallback(() => {
    setStatus("idle");

    setMessage(
      "Face verification has not started.",
    );
  }, []);

  return {
    status,
    canProceed: status === "passed",
    message,
    evaluateDetection,
    resetVerification,
  };
}