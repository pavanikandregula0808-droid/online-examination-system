import { useEffect } from "react";
import { useCamera } from "../hooks/useCamera";
import { useFaceCapture } from "../hooks/useFaceCapture";
import { useFaceDetection } from "../hooks/useFaceDetection";
import { useFaceVerification } from "../hooks/useFaceVerification";

export function CameraPreview() {
  const {
    videoRef,
    status,
    error,
    startCamera,
    stopCamera,
  } = useCamera();

  const {
    capturedImage,
    captureFrame,
    retake,
  } = useFaceCapture(videoRef);

  const {
    status: detectionStatus,
    faceCount,
    error: detectionError,
    detectFace,
    resetDetection,
  } = useFaceDetection();

  const {
    status: verificationStatus,
    canProceed,
    message: verificationMessage,
    evaluateDetection,
    resetVerification,
  } = useFaceVerification();

  const isCameraReady = status === "ready";
  const isRequesting = status === "requesting";

  useEffect(() => {
    if (
      detectionStatus === "detected" ||
      detectionStatus === "not-detected" ||
      detectionStatus === "multiple-faces"
    ) {
      evaluateDetection(faceCount);
    }
  }, [detectionStatus, faceCount, evaluateDetection]);

  const handleCapture = () => {
    const captured = captureFrame();

    if (!captured) {
      console.error("Unable to capture the current camera frame.");
      return;
    }

    resetDetection();
    resetVerification();
  };

  const handleRetake = () => {
    retake();
    resetDetection();
    resetVerification();
  };

  const handleDetectFace = async () => {
    if (!capturedImage) {
      return;
    }

    await detectFace(capturedImage);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">

      {/* Top Header */}
      <div className="mx-auto mb-8 flex max-w-7xl items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
        <div>
          <p className="text-lg font-bold text-slate-900">
            Online Examination
          </p>

          <p className="text-sm text-slate-500">
            Secure • Reliable • Transparent
          </p>
        </div>

        <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
          Step 1 of 3
        </div>
      </div>

      {/* Page Header */}
      <header className="mx-auto mb-8 max-w-7xl text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-600">
          Online Examination
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          Identity Verification
        </h1>

        <div className="mx-auto mt-3 h-1 w-14 rounded-full bg-blue-600" />

        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600">
          Capture a clear photo for the examination verification process.
          Make sure only you are visible in the camera frame.
        </p>
      </header>

      {/* Main Card */}
      <section className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">

        {/* Card Header */}
        <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Face Capture
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Position your face inside the camera frame.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

              {isCameraReady ? "Camera Ready" : "Camera Not Ready"}
            </div>

          </div>
        </div>

        <div className="p-6 sm:p-8">

          {/* Instructions */}
          <div className="mb-8 grid gap-4 md:grid-cols-3">

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="font-semibold text-slate-900">
                Face forward
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Look directly toward the camera with your face clearly visible.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="font-semibold text-slate-900">
                Good lighting
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Make sure your face is well lit and clearly visible.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="font-semibold text-slate-900">
                One person only
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                No other person should appear in the camera frame.
              </p>
            </div>

          </div>

          {/* Camera + Status */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.8fr)]">

            {/* Camera Section */}
            <div className="min-w-0">

              <div className="relative overflow-hidden rounded-2xl bg-slate-950">

                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`aspect-video w-full object-cover ${
                    capturedImage ? "hidden" : "block"
                  }`}
                />

                {capturedImage && (
                  <img
                    src={capturedImage}
                    alt="Captured verification photo"
                    className="aspect-video w-full object-cover"
                  />
                )}

                {/* Face Positioning Frame */}
                {!capturedImage && isCameraReady && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="h-[75%] w-[38%] min-w-44 rounded-[45%] border-2 border-dashed border-white/90 shadow-[0_0_0_9999px_rgba(15,23,42,0.2)]" />
                  </div>
                )}

                {/* Camera State */}
                {!capturedImage && !isCameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center px-6">
                    <div className="max-w-sm text-center text-white">

                      {status === "idle" && (
                        <>
                          <p className="text-xl font-bold">
                            Camera access required
                          </p>

                          <p className="mt-2 text-sm text-slate-300">
                            Allow camera access to continue.
                          </p>
                        </>
                      )}

                      {isRequesting && (
                        <>
                          <p className="text-xl font-bold">
                            Starting camera...
                          </p>

                          <p className="mt-2 text-sm text-slate-300">
                            Please wait.
                          </p>
                        </>
                      )}

                      {status === "denied" && (
                        <>
                          <p className="text-xl font-bold">
                            Camera permission denied
                          </p>

                          <p className="mt-2 text-sm text-slate-300">
                            Allow camera permission in your browser and try
                            again.
                          </p>
                        </>
                      )}

                      {status === "unavailable" && (
                        <>
                          <p className="text-xl font-bold">
                            Camera unavailable
                          </p>

                          <p className="mt-2 text-sm text-slate-300">
                            No usable camera was found on this device.
                          </p>
                        </>
                      )}

                      {status === "error" && (
                        <>
                          <p className="text-xl font-bold">
                            Camera error
                          </p>

                          <p className="mt-2 text-sm text-slate-300">
                            {error ?? "Unable to start the camera."}
                          </p>
                        </>
                      )}

                    </div>
                  </div>
                )}

              </div>

              {/* Camera Controls */}
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">

                {!capturedImage && !isCameraReady && (
                  <button
                    type="button"
                    onClick={() => {
                      void startCamera();
                    }}
                    disabled={isRequesting}
                    className="w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isRequesting
                      ? "Starting camera..."
                      : "Allow Camera"}
                  </button>
                )}

                {!capturedImage && isCameraReady && (
                  <>
                    <button
                      type="button"
                      onClick={handleCapture}
                      className="flex-1 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700"
                    >
                      Capture Photo
                    </button>

                    <button
                      type="button"
                      onClick={stopCamera}
                      className="flex-1 rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      Stop Camera
                    </button>
                  </>
                )}

                {capturedImage && (
                  <>
                    {(detectionStatus === "idle" ||
                      detectionStatus === "ready") && (
                      <button
                        type="button"
                        onClick={handleDetectFace}
                        className="flex-1 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700"
                      >
                        Detect Face
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleRetake}
                      className="flex-1 rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      Retake
                    </button>
                  </>
                )}

              </div>

            </div>

            {/* Status Section */}
            <aside className="rounded-2xl border border-slate-200 bg-white p-5">

              <h3 className="text-lg font-bold text-slate-900">
                Status
              </h3>

              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-900">
                  Verification guidance
                </p>

                <p className="mt-2 text-sm leading-6 text-blue-800">
                  Capture your photo first, then select
                  <strong> Detect Face </strong>
                  to check whether exactly one face is present.
                </p>
              </div>

              <div className="mt-6">
                <p className="mb-3 text-sm font-bold text-slate-900">
                  Face Detection Status
                </p>

                <div className="space-y-3">

                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="font-semibold text-amber-900">
                      No face detected
                    </p>

                    <p className="mt-1 text-sm text-amber-800">
                      No face was found in the image.
                    </p>
                  </div>

                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="font-semibold text-emerald-900">
                      One face detected
                    </p>

                    <p className="mt-1 text-sm text-emerald-800">
                      Exactly one face was detected.
                    </p>
                  </div>

                  <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="font-semibold text-red-900">
                      Multiple faces detected
                    </p>

                    <p className="mt-1 text-sm text-red-800">
                      More than one face was found.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">
                      Detection error
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      Face detection could not be completed.
                    </p>
                  </div>

                </div>
              </div>

              {/* Dynamic Result */}
              {capturedImage && (
                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">

                  <p className="text-sm font-bold text-slate-900">
                    Current Result
                  </p>

                  {detectionStatus === "loading" && (
                    <p className="mt-2 text-sm text-blue-700">
                      Loading face detection model...
                    </p>
                  )}

                  {detectionStatus === "detecting" && (
                    <p className="mt-2 text-sm text-blue-700">
                      Detecting faces...
                    </p>
                  )}

                  {detectionStatus === "detected" && (
                    <p className="mt-2 text-sm font-semibold text-emerald-700">
                      Exactly one face detected. Face count: {faceCount}
                    </p>
                  )}

                  {detectionStatus === "not-detected" && (
                    <p className="mt-2 text-sm font-semibold text-amber-700">
                      No face detected. Please retake the photo.
                    </p>
                  )}

                  {detectionStatus === "multiple-faces" && (
                    <p className="mt-2 text-sm font-semibold text-red-700">
                      Multiple faces detected: {faceCount}. Please retake the
                      photo with only one person visible.
                    </p>
                  )}

                  {detectionStatus === "error" && (
                    <p className="mt-2 text-sm text-red-700">
                      {detectionError ??
                        "Face detection could not be completed."}
                    </p>
                  )}

                  {verificationStatus === "passed" && canProceed && (
                    <div className="mt-4 border-t border-slate-200 pt-4">
                      <p className="text-sm font-bold text-emerald-700">
                        Face-detection requirement passed
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        {verificationMessage}
                      </p>
                    </div>
                  )}

                </div>
              )}

            </aside>

          </div>

          {/* Privacy Notice */}
          <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">

            <p className="text-sm font-bold text-slate-900">
              Privacy Notice
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              This stage checks whether a face is present in the captured
              image. Face detection alone does not confirm your identity.
            </p>

          </div>

        </div>
      </section>
    </main>
  );
}