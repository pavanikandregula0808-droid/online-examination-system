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
  | "face-too-small"
  | "face-off-center"
  | "error";

interface FaceDetectionQuality {
  faceWidthRatio: number;
  faceHeightRatio: number;
  centerXRatio: number;
  centerYRatio: number;
}

interface UseFaceDetectionResult {
  status: FaceDetectionStatus;
  faceCount: number;
  error: string | null;
  quality: FaceDetectionQuality | null;
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

  const [quality, setQuality] =
    useState<FaceDetectionQuality | null>(null);

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
    setQuality(null);
  }, []);

  const detectFace = useCallback(
    async (imageDataUrl: string) => {
      setStatus("detecting");
      setError(null);
      setFaceCount(0);
      setQuality(null);

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

        // No face
        if (detectedFaceCount === 0) {
          setStatus("not-detected");
          return;
        }

        // More than one face
        if (detectedFaceCount > 1) {
          setStatus("multiple-faces");
          return;
        }

        const detection = result.detections[0];

        if (!detection.boundingBox) {
          setStatus("detected");
          return;
        }

        const {
          originX,
          originY,
          width,
          height,
        } = detection.boundingBox;

        const imageWidth = image.naturalWidth;
        const imageHeight = image.naturalHeight;

        if (!imageWidth || !imageHeight) {
          setStatus("detected");
          return;
        }

        const faceWidthRatio =
          width / imageWidth;

        const faceHeightRatio =
          height / imageHeight;

        const faceCenterX =
          originX + width / 2;

        const faceCenterY =
          originY + height / 2;

        const centerXRatio =
          faceCenterX / imageWidth;

        const centerYRatio =
          faceCenterY / imageHeight;

        const faceQuality: FaceDetectionQuality = {
          faceWidthRatio,
          faceHeightRatio,
          centerXRatio,
          centerYRatio,
        };

        setQuality(faceQuality);

        /*
         * Face size validation
         *
         * We don't require the face to fill the entire
         * camera frame. We only make sure the detected
         * face is large enough to be useful.
         */
        const minimumFaceWidthRatio = 0.15;
        const minimumFaceHeightRatio = 0.15;

        if (
          faceWidthRatio < minimumFaceWidthRatio ||
          faceHeightRatio < minimumFaceHeightRatio
        ) {
          setStatus("face-too-small");
          return;
        }

        /*
         * Face position validation
         *
         * We allow a reasonable amount of movement instead
         * of requiring the face to be perfectly centered.
         */
        const minimumCenterX = 0.30;
        const maximumCenterX = 0.70;

        const minimumCenterY = 0.25;
        const maximumCenterY = 0.75;

        const isHorizontallyCentered =
          centerXRatio >= minimumCenterX &&
          centerXRatio <= maximumCenterX;

        const isVerticallyCentered =
          centerYRatio >= minimumCenterY &&
          centerYRatio <= maximumCenterY;

        if (
          !isHorizontallyCentered ||
          !isVerticallyCentered
        ) {
          setStatus("face-off-center");
          return;
        }

        // Exactly one face with acceptable quality
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
    quality,
    detectFace,
    resetDetection,
  };
}