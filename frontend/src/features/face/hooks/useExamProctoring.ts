import { useCallback, useEffect, useRef, useState } from "react";
import {
  FaceDetector,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

export type ProctoringStatus =
  | "idle"
  | "loading"
  | "monitoring"
  | "no-face"
  | "multiple-faces"
  | "error";

export type ProctoringEventType =
  | "NO_FACE"
  | "MULTIPLE_FACES"
  | "FACE_MOVEMENT";

export interface ProctoringEvent {
  id: string;
  type: ProctoringEventType;
  faceCount: number;
  timestamp: number;
  evidenceImage: string | null;
}

interface FaceBoundingBox {
  originX: number;
  originY: number;
  width: number;
  height: number;
}

interface UseExamProctoringResult {
  status: ProctoringStatus;
  faceCount: number;
  events: ProctoringEvent[];
  warningCount: number;
  error: string | null;
  startMonitoring: () => Promise<void>;
  stopMonitoring: () => void;
  clearEvents: () => void;
}

const WASM_PATH =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm";

const FACE_MODEL_PATH =
  "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite";

/*
 * Run face analysis approximately every 500 ms.
 */
const ANALYSIS_INTERVAL_MS = 500;

/*
 * Suspicious condition must remain
 * for this long before an event is created.
 */
const CONFIRMATION_DURATION_MS = 1500;

/*
 * Prevent repeated events of the same type
 * from being generated too frequently.
 */
const EVENT_COOLDOWN_MS = 5000;

/*
 * Minimum normalized movement required
 * to consider face movement significant.
 *
 * This does NOT mean cheating.
 * It is only a movement/position anomaly.
 */
const FACE_MOVEMENT_THRESHOLD = 0.20;

export function useExamProctoring(
  videoRef: React.RefObject<HTMLVideoElement | null>,
): UseExamProctoringResult {
  /*
   * MediaPipe detector instance.
   */
  const detectorRef = useRef<FaceDetector | null>(null);

  /*
   * requestAnimationFrame identifier.
   */
  const animationFrameRef = useRef<number | null>(null);

  /*
   * Last frame analysis timestamp.
   */
  const lastAnalysisTimeRef = useRef(0);

  /*
   * Whether monitoring is currently active.
   */
  const isMonitoringRef = useRef(false);

  /*
   * Tracks when the current suspicious
   * condition started.
   */
  const suspiciousSinceRef = useRef<number | null>(null);

  /*
   * Tracks the currently observed
   * suspicious condition.
   */
  const suspiciousTypeRef =
    useRef<ProctoringEventType | null>(null);

  /*
   * Stores the previous face position
   * for movement comparison.
   */
  const previousFaceBoxRef =
    useRef<FaceBoundingBox | null>(null);

  /*
   * Stores the last confirmed event time
   * separately for each event type.
   */
  const lastEventTimeRef =
    useRef<Record<ProctoringEventType, number>>({
      NO_FACE: 0,
      MULTIPLE_FACES: 0,
      FACE_MOVEMENT: 0,
    });

  const [status, setStatus] =
    useState<ProctoringStatus>("idle");

  const [faceCount, setFaceCount] =
    useState(0);

  const [events, setEvents] =
    useState<ProctoringEvent[]>([]);

  const [error, setError] =
    useState<string | null>(null);

  /*
   * Number of confirmed incidents.
   */
  const warningCount = events.length;

  /*
   * Initialize MediaPipe FaceDetector.
   */
  const initializeDetector = useCallback(
    async () => {
      /*
       * Reuse existing detector.
       */
      if (detectorRef.current) {
        return detectorRef.current;
      }

      setStatus("loading");
      setError(null);

      try {
        const vision =
          await FilesetResolver.forVisionTasks(
            WASM_PATH,
          );

        const detector =
          await FaceDetector.createFromOptions(
            vision,
            {
              baseOptions: {
                modelAssetPath:
                  FACE_MODEL_PATH,
              },

              runningMode: "VIDEO",

              minDetectionConfidence: 0.35,

              minSuppressionThreshold: 0.3,
            },
          );

        detectorRef.current = detector;

        return detector;
      } catch (initializationError) {
        console.error(
          "Failed to initialize MediaPipe FaceDetector:",
          initializationError,
        );

        setStatus("error");

        setError(
          "Face detection could not be initialized.",
        );

        throw initializationError;
      }
    },
    [],
  );

  /*
   * Capture the current camera frame
   * as JPEG evidence.
   */
  const captureEvidence = useCallback(
    (): string | null => {
      const video = videoRef.current;

      if (!video) {
        return null;
      }

      if (
        video.videoWidth === 0 ||
        video.videoHeight === 0
      ) {
        return null;
      }

      const canvas =
        document.createElement("canvas");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context =
        canvas.getContext("2d");

      if (!context) {
        return null;
      }

      context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height,
      );

      return canvas.toDataURL(
        "image/jpeg",
        0.8,
      );
    },
    [videoRef],
  );

  /*
   * Create a confirmed proctoring event.
   */
  const confirmSuspiciousEvent =
    useCallback(
      (
        type: ProctoringEventType,
        detectedFaceCount: number,
      ) => {
        const now = Date.now();

        const lastEventTime =
          lastEventTimeRef.current[type];

        /*
         * Prevent duplicate screenshots/events
         * during the cooldown period.
         */
        if (
          now - lastEventTime <
          EVENT_COOLDOWN_MS
        ) {
          return;
        }

        const evidenceImage =
          captureEvidence();

        const event: ProctoringEvent = {
          id: `${type}-${now}`,

          type,

          faceCount:
            detectedFaceCount,

          timestamp: now,

          evidenceImage,
        };

        setEvents(
          (previousEvents) => [
            ...previousEvents,
            event,
          ],
        );

        lastEventTimeRef.current[type] =
          now;

        /*
         * Reset suspicious-condition tracking.
         */
        suspiciousSinceRef.current =
          null;

        suspiciousTypeRef.current =
          null;
      },
      [captureEvidence],
    );

  /*
   * Process one face-detection result.
   */
  const processDetection =
    useCallback(
      (
        detectedFaceCount: number,
        currentTime: number,
        faceBox: FaceBoundingBox | null,
      ) => {
        setFaceCount(
          detectedFaceCount,
        );

        /*
         * ======================================
         * EXACTLY ONE FACE
         * ======================================
         */
        if (detectedFaceCount === 1) {
          setStatus("monitoring");

          /*
           * Compare the current face position
           * with the previous position.
           */
          if (
            faceBox &&
            previousFaceBoxRef.current
          ) {
            const previous =
              previousFaceBoxRef.current;

            /*
             * Calculate center of previous face.
             */
            const previousCenterX =
              previous.originX +
              previous.width / 2;

            const previousCenterY =
              previous.originY +
              previous.height / 2;

            /*
             * Calculate center of current face.
             */
            const currentCenterX =
              faceBox.originX +
              faceBox.width / 2;

            const currentCenterY =
              faceBox.originY +
              faceBox.height / 2;

            /*
             * Calculate normalized movement.
             *
             * Using previous face dimensions
             * makes this less dependent on
             * camera resolution.
             */
            const movementX =
              Math.abs(
                currentCenterX -
                  previousCenterX,
              ) / Math.max(
                previous.width,
                1,
              );

            const movementY =
              Math.abs(
                currentCenterY -
                  previousCenterY,
              ) / Math.max(
                previous.height,
                1,
              );

            const movementAmount =
              Math.max(
                movementX,
                movementY,
              );

            /*
             * Significant movement detected.
             */
            if (
              movementAmount >=
              FACE_MOVEMENT_THRESHOLD
            ) {
              /*
               * Start tracking movement.
               */
              if (
                suspiciousTypeRef.current !==
                "FACE_MOVEMENT"
              ) {
                suspiciousTypeRef.current =
                  "FACE_MOVEMENT";

                suspiciousSinceRef.current =
                  currentTime;
              } else if (
                suspiciousSinceRef.current !==
                null
              ) {
                /*
                 * Movement has continued.
                 */
                const duration =
                  currentTime -
                  suspiciousSinceRef.current;

                /*
                 * Confirm movement anomaly
                 * only after persistence.
                 */
                if (
                  duration >=
                  CONFIRMATION_DURATION_MS
                ) {
                  confirmSuspiciousEvent(
                    "FACE_MOVEMENT",
                    detectedFaceCount,
                  );
                }
              }
            } else {
              /*
               * Movement returned to normal.
               */
              if (
                suspiciousTypeRef.current ===
                "FACE_MOVEMENT"
              ) {
                suspiciousTypeRef.current =
                  null;

                suspiciousSinceRef.current =
                  null;
              }
            }

            /*
             * Save current position for
             * the next comparison.
             */
            previousFaceBoxRef.current =
              faceBox;
          } else if (faceBox) {
            /*
             * First valid face detection.
             */
            previousFaceBoxRef.current =
              faceBox;
          }

          /*
           * If there is no active movement
           * anomaly, clear suspicious tracking.
           */
          if (
            suspiciousTypeRef.current !==
            "FACE_MOVEMENT"
          ) {
            suspiciousSinceRef.current =
              null;

            suspiciousTypeRef.current =
              null;
          }

          return;
        }

        /*
         * ======================================
         * ZERO OR MULTIPLE FACES
         * ======================================
         */

        let suspiciousType:
          | ProctoringEventType
          | null = null;

        /*
         * No face detected.
         */
        if (detectedFaceCount === 0) {
          suspiciousType =
            "NO_FACE";

          setStatus("no-face");
        }

        /*
         * More than one face detected.
         */
        if (detectedFaceCount > 1) {
          suspiciousType =
            "MULTIPLE_FACES";

          setStatus("multiple-faces");
        }

        /*
         * We cannot compare movement when
         * there is not exactly one face.
         */
        previousFaceBoxRef.current =
          null;

        if (!suspiciousType) {
          return;
        }

        /*
         * A different suspicious condition
         * has started.
         */
        if (
          suspiciousTypeRef.current !==
          suspiciousType
        ) {
          suspiciousTypeRef.current =
            suspiciousType;

          suspiciousSinceRef.current =
            currentTime;

          return;
        }

        /*
         * The same suspicious condition
         * is continuing.
         */
        if (
          suspiciousSinceRef.current !==
          null
        ) {
          const duration =
            currentTime -
            suspiciousSinceRef.current;

          /*
           * Confirm only after the condition
           * has persisted long enough.
           */
          if (
            duration >=
            CONFIRMATION_DURATION_MS
          ) {
            confirmSuspiciousEvent(
              suspiciousType,
              detectedFaceCount,
            );
          }
        }
      },
      [confirmSuspiciousEvent],
    );

  /*
   * Analyze the current camera frame.
   */
  const analyzeFrame =
    useCallback(
      async (timestamp: number) => {
        if (
          !isMonitoringRef.current
        ) {
          return;
        }

        const video =
          videoRef.current;

        if (!video) {
          return;
        }

        /*
         * Camera must have usable data.
         */
        if (
          video.readyState <
          HTMLMediaElement.HAVE_CURRENT_DATA
        ) {
          return;
        }

        if (
          video.videoWidth === 0 ||
          video.videoHeight === 0
        ) {
          return;
        }

        try {
          const detector =
            await initializeDetector();

          /*
           * Run MediaPipe detection.
           */
          const result =
            detector.detectForVideo(
              video,
              timestamp,
            );

          const detections =
            result.detections;

          const detectedFaceCount =
            detections.length;

          /*
           * Get bounding box when exactly
           * one face is detected.
           */
          let faceBox:
            | FaceBoundingBox
            | null = null;

          if (
            detectedFaceCount === 1
          ) {
            const boundingBox =
              detections[0]
                .boundingBox;

            if (boundingBox) {
              faceBox = {
                originX:
                  boundingBox.originX,

                originY:
                  boundingBox.originY,

                width:
                  boundingBox.width,

                height:
                  boundingBox.height,
              };
            }
          }

          /*
           * Process detection result.
           */
          processDetection(
            detectedFaceCount,
            timestamp,
            faceBox,
          );
        } catch (
          monitoringError
        ) {
          console.error(
            "Exam proctoring detection failed:",
            monitoringError,
          );

          setStatus("error");

          setError(
            "Camera monitoring could not be completed.",
          );
        }
      },
      [
        initializeDetector,
        processDetection,
        videoRef,
      ],
    );

  /*
   * Continuous monitoring loop.
   */
  const monitoringLoop =
    useCallback(
      (timestamp: number) => {
        if (
          !isMonitoringRef.current
        ) {
          return;
        }

        /*
         * Analyze only according to
         * the configured interval.
         */
        if (
          timestamp -
            lastAnalysisTimeRef.current >=
          ANALYSIS_INTERVAL_MS
        ) {
          lastAnalysisTimeRef.current =
            timestamp;

          void analyzeFrame(timestamp);
        }

        /*
         * Continue monitoring.
         */
        animationFrameRef.current =
          requestAnimationFrame(
            monitoringLoop,
          );
      },
      [analyzeFrame],
    );

  /*
   * Start exam monitoring.
   */
  const startMonitoring =
    useCallback(
      async () => {
        try {
          setError(null);

          /*
           * Initialize MediaPipe first.
           */
          await initializeDetector();

          /*
           * Enable monitoring.
           */
          isMonitoringRef.current =
            true;

          setStatus("monitoring");

          /*
           * Reset analysis timing.
           */
          lastAnalysisTimeRef.current =
            performance.now();

          /*
           * Reset movement tracking.
           */
          previousFaceBoxRef.current =
            null;

          suspiciousSinceRef.current =
            null;

          suspiciousTypeRef.current =
            null;

          /*
           * Cancel an existing loop
           * before starting another one.
           */
          if (
            animationFrameRef.current !==
            null
          ) {
            cancelAnimationFrame(
              animationFrameRef.current,
            );
          }

          /*
           * Start continuous monitoring.
           */
          animationFrameRef.current =
            requestAnimationFrame(
              monitoringLoop,
            );
        } catch (
          monitoringError
        ) {
          console.error(
            "Unable to start exam monitoring:",
            monitoringError,
          );

          isMonitoringRef.current =
            false;

          setStatus("error");

          setError(
            "Unable to start camera monitoring.",
          );
        }
      },
      [
        initializeDetector,
        monitoringLoop,
      ],
    );

  /*
   * Stop exam monitoring.
   */
  const stopMonitoring =
    useCallback(() => {
      isMonitoringRef.current =
        false;

      /*
       * Stop animation loop.
       */
      if (
        animationFrameRef.current !==
        null
      ) {
        cancelAnimationFrame(
          animationFrameRef.current,
        );

        animationFrameRef.current =
          null;
      }

      setStatus("idle");

      setFaceCount(0);

      /*
       * Reset suspicious state.
       */
      suspiciousSinceRef.current =
        null;

      suspiciousTypeRef.current =
        null;

      previousFaceBoxRef.current =
        null;
    }, []);

  /*
   * Clear all recorded incidents.
   */
  const clearEvents =
    useCallback(() => {
      setEvents([]);

      /*
       * Reset cooldown timers.
       */
      lastEventTimeRef.current = {
        NO_FACE: 0,
        MULTIPLE_FACES: 0,
        FACE_MOVEMENT: 0,
      };

      /*
       * Reset suspicious tracking.
       */
      suspiciousSinceRef.current =
        null;

      suspiciousTypeRef.current =
        null;

      previousFaceBoxRef.current =
        null;
    }, []);

  /*
   * Cleanup when component unmounts.
   */
  useEffect(() => {
    return () => {
      isMonitoringRef.current =
        false;

      /*
       * Cancel monitoring loop.
       */
      if (
        animationFrameRef.current !==
        null
      ) {
        cancelAnimationFrame(
          animationFrameRef.current,
        );

        animationFrameRef.current =
          null;
      }

      /*
       * Close MediaPipe detector.
       */
      detectorRef.current?.close();

      detectorRef.current = null;
    };
  }, []);

  return {
    status,
    faceCount,
    events,
    warningCount,
    error,
    startMonitoring,
    stopMonitoring,
    clearEvents,
  };
}