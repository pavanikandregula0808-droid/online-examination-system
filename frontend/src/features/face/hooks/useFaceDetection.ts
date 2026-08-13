import { useCallback, useEffect, useRef, useState } from "react";
import {
  FaceDetector,
  FilesetResolver,
  type FaceDetectorResult,
} from "@mediapipe/tasks-vision";

export type FaceDetectionStatus =
  | "idle"
  | "loading"
  | "ready"
  | "detecting"
  | "detected"
  | "not-detected"
  | "multiple-faces"
  | "error";

interface UseFaceDetectionResult {
  status: FaceDetectionStatus;
  faceCount: number;
  error: string | null;
  detectFace: (imageDataUrl: string) => Promise<void>;
  resetDetection: () => void;
}

const WASM_PATH =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm";

const FACE_MODEL_PATH =
  "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite";

export function useFaceDetection(): UseFaceDetectionResult {
  const detectorRef = useRef<FaceDetector | null>(null);

  const [status, setStatus] =
    useState<FaceDetectionStatus>("idle");

  const [faceCount, setFaceCount] = useState(0);

  const [error, setError] =
    useState<string | null>(null);

  const initializeDetector = useCallback(async () => {
    if (detectorRef.current) {
      return detectorRef.current;
    }

    setStatus("loading");
    setError(null);

    const vision =
      await FilesetResolver.forVisionTasks(WASM_PATH);

    const detector =
      await FaceDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: FACE_MODEL_PATH,
        },
        runningMode: "IMAGE",
        minDetectionConfidence: 0.35,
        minSuppressionThreshold: 0.3,
      });

    detectorRef.current = detector;

    setStatus("ready");

    return detector;
  }, []);

  const resetDetection = useCallback(() => {
    setStatus("idle");
    setFaceCount(0);
    setError(null);
  }, []);

  const detectFace = useCallback(
    async (imageDataUrl: string) => {
      setStatus("detecting");
      setError(null);
      setFaceCount(0);

      try {
        const detector =
          await initializeDetector();

        const image = new Image();

        await new Promise<void>((resolve, reject) => {
          image.onload = () => resolve();

          image.onerror = () =>
            reject(
              new Error(
                "Captured image could not be loaded.",
              ),
            );

          image.src = imageDataUrl;
        });

        const result: FaceDetectorResult =
          detector.detect(image);

        const detectedFaceCount =
          result.detections.length;

        setFaceCount(detectedFaceCount);

        if (detectedFaceCount === 0) {
          setStatus("not-detected");
          return;
        }

        if (detectedFaceCount > 1) {
          setStatus("multiple-faces");
          return;
        }

        setStatus("detected");
      } catch (detectionError) {
        console.error(
          "Face detection failed:",
          detectionError,
        );

        setStatus("error");

        setError(
          "Face detection could not be completed. Please try capturing the photo again.",
        );
      }
    },
    [initializeDetector],
  );

  useEffect(() => {
    return () => {
      detectorRef.current?.close();
      detectorRef.current = null;
    };
  }, []);

  return {
    status,
    faceCount,
    error,
    detectFace,
    resetDetection,
  };
}