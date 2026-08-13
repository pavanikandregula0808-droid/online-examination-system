import { useCallback, useEffect, useRef, useState } from "react";

export type CameraStatus =
  | "idle"
  | "requesting"
  | "ready"
  | "denied"
  | "unavailable"
  | "error";

interface UseCameraResult {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  status: CameraStatus;
  error: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
}

export function useCamera(): UseCameraResult {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<CameraStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setStatus("idle");
  }, []);

  const startCamera = useCallback(async () => {
    setStatus("requesting");
    setError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("unavailable");
      setError("Camera access is not supported by this browser.");
      return;
    }

    try {
      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: {
            ideal: 1280,
          },
          height: {
            ideal: 720,
          },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (!videoRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        setStatus("error");
        setError("Camera preview could not be initialized.");
        return;
      }

      videoRef.current.srcObject = stream;

      await videoRef.current.play();

      setStatus("ready");
    } catch (cameraError) {
      if (cameraError instanceof DOMException) {
        if (
          cameraError.name === "NotAllowedError" ||
          cameraError.name === "PermissionDeniedError"
        ) {
          setStatus("denied");
          setError(
            "Camera permission was denied. Please allow camera access and try again.",
          );
          return;
        }

        if (
          cameraError.name === "NotFoundError" ||
          cameraError.name === "DevicesNotFoundError"
        ) {
          setStatus("unavailable");
          setError("No camera was found on this device.");
          return;
        }
      }

      setStatus("error");
      setError("Unable to start the camera. Please try again.");
    }
  }, [stopCamera]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });

        streamRef.current = null;
      }
    };
  }, []);

  return {
    videoRef,
    status,
    error,
    startCamera,
    stopCamera,
  };
}