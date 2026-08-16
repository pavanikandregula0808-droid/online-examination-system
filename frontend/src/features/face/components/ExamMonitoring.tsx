import { useEffect } from "react";
import type { RefObject } from "react";
import { useExamProctoring } from "../hooks/useExamProctoring";

interface ExamMonitoringProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  isExamActive: boolean;
}

export function ExamMonitoring({
  videoRef,
  isExamActive,
}: ExamMonitoringProps) {
  const {
    status,
    faceCount,
    events,
    warningCount,
    error,
    startMonitoring,
    stopMonitoring,
  } = useExamProctoring(videoRef);

  /*
   * Automatically start/stop monitoring
   * according to the examination lifecycle.
   */
  useEffect(() => {
    if (isExamActive) {
      void startMonitoring();
    } else {
      stopMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [
    isExamActive,
    startMonitoring,
    stopMonitoring,
  ]);

  /*
   * Do not render monitoring UI
   * when the examination is inactive.
   */
  if (!isExamActive) {
    return null;
  }

  /*
   * Monitoring is considered healthy
   * when exactly one face is detected.
   */
  const isActive =
    status === "monitoring";

  /*
   * These statuses require the student's
   * attention but do not automatically
   * mean misconduct.
   */
  const isWarning =
    status === "no-face" ||
    status === "multiple-faces";

  /*
   * Return a human-readable event name.
   */
  const getEventLabel = (
    eventType: string,
  ) => {
    switch (eventType) {
      case "NO_FACE":
        return "Face not detected";

      case "MULTIPLE_FACES":
        return "Multiple faces detected";

      case "FACE_MOVEMENT":
        return "Significant face movement detected";

      default:
        return "Monitoring event";
    }
  };

  /*
   * Return the current monitoring status.
   */
  const getStatusLabel = () => {
    switch (status) {
      case "loading":
        return "Preparing monitoring...";

      case "monitoring":
        return "Camera monitoring active";

      case "no-face":
        return "Face not visible";

      case "multiple-faces":
        return "Multiple faces detected";

      case "error":
        return "Monitoring unavailable";

      default:
        return "Starting monitoring...";
    }
  };

  /*
   * Return an explanation for the current status.
   */
  const getStatusMessage = () => {
    switch (status) {
      case "monitoring":
        return "Your camera is being monitored during the examination.";

      case "no-face":
        return "Please remain visible within the camera frame.";

      case "multiple-faces":
        return "Only the registered candidate should be visible.";

      case "error":
        return (
          error ??
          "Camera monitoring could not be completed."
        );

      default:
        return "Exam monitoring is being initialized.";
    }
  };

  return (
    <section
      aria-label="Exam monitoring status"
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      {/* ========================================= */}
      {/* HEADER                                    */}
      {/* ========================================= */}

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-900">
            Exam Monitoring
          </p>

          <p className="mt-0.5 text-xs text-slate-500">
            Automated examination monitoring is active.
          </p>
        </div>

        <div
          className={`flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${
            isActive
              ? "bg-emerald-50 text-emerald-700"
              : isWarning
                ? "bg-amber-50 text-amber-700"
                : status === "error"
                  ? "bg-red-50 text-red-700"
                  : "bg-slate-100 text-slate-600"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isActive
                ? "bg-emerald-500"
                : isWarning
                  ? "bg-amber-500"
                  : status === "error"
                    ? "bg-red-500"
                    : "bg-slate-400"
            }`}
          />

          {isActive
            ? "Active"
            : isWarning
              ? "Attention"
              : status === "error"
                ? "Error"
                : "Starting"}
        </div>
      </div>

      {/* ========================================= */}
      {/* CURRENT STATUS                            */}
      {/* ========================================= */}

      <div
        className={`mt-4 rounded-xl border p-4 ${
          isActive
            ? "border-emerald-200 bg-emerald-50"
            : isWarning
              ? "border-amber-200 bg-amber-50"
              : status === "error"
                ? "border-red-200 bg-red-50"
                : "border-blue-200 bg-blue-50"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${
              isActive
                ? "bg-emerald-100"
                : isWarning
                  ? "bg-amber-100"
                  : status === "error"
                    ? "bg-red-100"
                    : "bg-blue-100"
            }`}
          >
            {isActive
              ? "✓"
              : isWarning
                ? "!"
                : status === "error"
                  ? "!"
                  : "•"}
          </div>

          <div>
            <p className="text-sm font-bold text-slate-900">
              {getStatusLabel()}
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-600">
              {getStatusMessage()}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* LIVE MONITORING STATS                    */}
      {/* ========================================= */}

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Current Faces
          </p>

          <p className="mt-1 text-xl font-bold text-slate-900">
            {faceCount}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Evidence Events
          </p>

          <p className="mt-1 text-xl font-bold text-slate-900">
            {warningCount}
          </p>
        </div>
      </div>

      {/* ========================================= */}
      {/* WARNING SUMMARY                           */}
      {/* ========================================= */}

      {warningCount > 0 && (
        <div
          className={`mt-3 rounded-xl border p-3 ${
            warningCount >= 3
              ? "border-red-200 bg-red-50"
              : "border-amber-200 bg-amber-50"
          }`}
        >
          <p
            className={`text-xs font-bold ${
              warningCount >= 3
                ? "text-red-900"
                : "text-amber-900"
            }`}
          >
            {warningCount >= 3
              ? "Repeated monitoring anomalies detected"
              : "Monitoring event recorded"}
          </p>

          <p
            className={`mt-1 text-xs leading-5 ${
              warningCount >= 3
                ? "text-red-700"
                : "text-amber-700"
            }`}
          >
            {warningCount >= 3
              ? "Please maintain the required examination conditions. The examination will continue."
              : "An evidence snapshot has been recorded for examination review."}
          </p>
        </div>
      )}

      {/* ========================================= */}
      {/* EVIDENCE LOG                              */}
      {/* ========================================= */}

      {events.length > 0 && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-900">
              Evidence Log
            </p>

            <span className="text-[10px] font-semibold text-slate-500">
              {events.length} recorded
            </span>
          </div>

          <div className="mt-2 space-y-2">
            {events
              .slice(-3)
              .reverse()
              .map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      {getEventLabel(
                        event.type,
                      )}
                    </p>

                    <p className="mt-0.5 text-[10px] text-slate-500">
                      {new Date(
                        event.timestamp,
                      ).toLocaleTimeString()}
                    </p>
                  </div>

                  <span className="rounded-full bg-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600">
                    Evidence
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* PRIVACY / ACCURACY NOTICE                 */}
      {/* ========================================= */}

      <p className="mt-3 text-[10px] leading-4 text-slate-400">
        Automated monitoring may occasionally
        produce inaccurate detections. Recorded
        events are intended for examination review
        and do not by themselves establish
        misconduct.
      </p>
    </section>
  );
}