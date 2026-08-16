import type { ProctoringEvent } from "../hooks/useExamProctoring";

interface ProctoringReportProps {
  events: ProctoringEvent[];
  isExamCompleted: boolean;
}

export function ProctoringReport({
  events,
  isExamCompleted,
}: ProctoringReportProps) {
  if (!isExamCompleted) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          Proctoring Review
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Automated monitoring events recorded during the examination.
        </p>
      </div>

      {/* No events */}
      {events.length === 0 && (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="font-semibold text-emerald-900">
            No monitoring events recorded
          </p>

          <p className="mt-1 text-sm text-emerald-700">
            No confirmed face-presence anomalies were recorded during
            the examination.
          </p>
        </div>
      )}

      {/* Events */}
      {events.length > 0 && (
        <>
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="font-semibold text-amber-900">
              {events.length} monitoring event
              {events.length === 1 ? "" : "s"} recorded
            </p>

            <p className="mt-1 text-sm text-amber-800">
              These events are provided for review. Automated detection
              alone does not establish misconduct.
            </p>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {events.map((event, index) => {
              const title =
                event.type === "NO_FACE"
                  ? "Face not detected"
                  : "Multiple faces detected";

              return (
                <article
                  key={event.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >
                  {/* Evidence image */}
                  {event.evidenceImage ? (
                    <img
                      src={event.evidenceImage}
                      alt={`Evidence snapshot ${index + 1}`}
                      className="aspect-video w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-video items-center justify-center bg-slate-100">
                      <p className="text-sm text-slate-500">
                        Evidence image unavailable
                      </p>
                    </div>
                  )}

                  {/* Event details */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Evidence {index + 1}
                        </p>

                        <h3 className="mt-1 font-bold text-slate-900">
                          {title}
                        </h3>
                      </div>

                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                        Review
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-slate-50 p-2.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Faces detected
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-800">
                          {event.faceCount}
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-50 p-2.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Time
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-800">
                          {new Date(
                            event.timestamp,
                          ).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}