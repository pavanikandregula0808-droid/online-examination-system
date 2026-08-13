import { useEffect } from "react";
import { useCamera } from "../hooks/useCamera";
import { useFaceCapture } from "../hooks/useFaceCapture";
import { useFaceDetection } from "../hooks/useFaceDetection";
import { useFaceVerification } from "../hooks/useFaceVerification";
import { facePrivacyPolicy } from "../privacyPolicy";

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
    <main className="min-h-screen bg-slate-50 px-4 py-5 sm:px-6 lg:px-8">

      {/* =========================================================
          TOP HEADER
      ========================================================= */}
      <div className="mx-auto mb-6 flex max-w-7xl items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
        <div>
          <p className="text-base font-bold text-slate-900">
            Online Examination
          </p>

          <p className="text-xs text-slate-500">
            Secure • Reliable • Transparent
          </p>
        </div>

        <div className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
          Step 1 of 3
        </div>
      </div>

      {/* =========================================================
          PAGE HEADER
      ========================================================= */}
      <header className="mx-auto mb-6 max-w-7xl text-center">

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Identity Verification
        </h1>

        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
          Capture a clear photo for examination verification.
        </p>

      </header>

      {/* =========================================================
          MAIN CARD
      ========================================================= */}
      <section className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">

        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7">

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Face Capture
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Position your face inside the camera frame.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isCameraReady
                  ? "bg-emerald-500"
                  : "bg-slate-300"
              }`}
            />

            <span
              className={
                isCameraReady
                  ? "text-emerald-600"
                  : "text-slate-500"
              }
            >
              {isCameraReady
                ? "Camera Ready"
                : "Camera Not Ready"}
            </span>
          </div>

        </div>

        <div className="p-5 sm:p-7">

          {/* =====================================================
              LEFT CAMERA + RIGHT STATUS
          ===================================================== */}
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)]">

            {/* ===================================================
                LEFT SIDE — CAMERA
            =================================================== */}
            <div className="min-w-0">

              {/* Camera */}
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

                {/* Face positioning frame */}
                {!capturedImage && isCameraReady && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">

                    <div className="h-[74%] w-[38%] min-w-40 rounded-[45%] border-2 border-dashed border-white/90 shadow-[0_0_0_9999px_rgba(15,23,42,0.2)]" />

                  </div>
                )}

                {/* Camera state */}
                {!capturedImage && !isCameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center px-5">

                    <div className="max-w-sm text-center text-white">

                      {status === "idle" && (
                        <>
                          <p className="text-lg font-bold">
                            Camera access required
                          </p>

                          <p className="mt-1.5 text-sm text-slate-300">
                            Allow camera access to continue.
                          </p>
                        </>
                      )}

                      {isRequesting && (
                        <>
                          <p className="text-lg font-bold">
                            Starting camera...
                          </p>

                          <p className="mt-1.5 text-sm text-slate-300">
                            Please wait.
                          </p>
                        </>
                      )}

                      {status === "denied" && (
                        <>
                          <p className="text-lg font-bold">
                            Camera permission denied
                          </p>

                          <p className="mt-1.5 text-sm text-slate-300">
                            Allow camera permission in your browser
                            and try again.
                          </p>
                        </>
                      )}

                      {status === "unavailable" && (
                        <>
                          <p className="text-lg font-bold">
                            Camera unavailable
                          </p>

                          <p className="mt-1.5 text-sm text-slate-300">
                            No usable camera was found on this device.
                          </p>
                        </>
                      )}

                      {status === "error" && (
                        <>
                          <p className="text-lg font-bold">
                            Camera error
                          </p>

                          <p className="mt-1.5 text-sm text-slate-300">
                            {error ?? "Unable to start the camera."}
                          </p>
                        </>
                      )}

                    </div>

                  </div>
                )}

              </div>

              {/* =================================================
                  CAMERA CONTROLS
              ================================================= */}
              <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">

                {!capturedImage && !isCameraReady && (
                  <button
                    type="button"
                    onClick={() => {
                      void startCamera();
                    }}
                    disabled={isRequesting}
                    className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                      className="flex-1 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                    >
                      Capture Photo
                    </button>

                    <button
                      type="button"
                      onClick={stopCamera}
                      className="flex-1 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
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
                        className="flex-1 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                      >
                        Detect Face
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleRetake}
                      className="flex-1 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      Retake
                    </button>
                  </>
                )}

              </div>

              {/* =================================================
                  THREE INSTRUCTIONS
              ================================================= */}
              <div className="mt-4 grid grid-cols-3 gap-2.5">

                {/* 01 */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">

                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    01
                  </p>

                  <p className="mt-0.5 text-xs font-bold text-slate-900 sm:text-sm">
                    Face forward
                  </p>

                  <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                    Look directly toward the camera.
                  </p>

                </div>

                {/* 02 */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">

                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    02
                  </p>

                  <p className="mt-0.5 text-xs font-bold text-slate-900 sm:text-sm">
                    Good lighting
                  </p>

                  <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                    Keep your face clearly visible.
                  </p>

                </div>

                {/* 03 */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">

                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    03
                  </p>

                  <p className="mt-0.5 text-xs font-bold text-slate-900 sm:text-sm">
                    One person only
                  </p>

                  <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                    No other person in the frame.
                  </p>

                </div>

              </div>

            </div>

            {/* ===================================================
                RIGHT SIDE — RESULT + PRIVACY
            =================================================== */}
            <aside className="min-w-0">

              {/* =================================================
                  VERIFICATION RESULT
              ================================================= */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-base font-bold text-slate-900">
                      Verification Result
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Current face-detection status
                    </p>
                  </div>

                  {faceCount > 0 && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      {faceCount}{" "}
                      {faceCount === 1 ? "face" : "faces"}
                    </span>
                  )}

                </div>

                {/* Fixed-height result container */}
                <div className="mt-4 min-h-[185px]">

                  {/* Before detection */}
                  {capturedImage &&
                    (detectionStatus === "idle" ||
                      detectionStatus === "ready") && (
                    <div className="flex min-h-[185px] flex-col justify-center rounded-xl border border-blue-200 bg-blue-50 p-4">

                      <p className="font-semibold text-blue-900">
                        Verification ready
                      </p>

                      <p className="mt-1.5 text-sm leading-5 text-blue-700">
                        Your photo has been captured.
                        Select <strong>Detect Face</strong> to
                        check whether exactly one face is present.
                      </p>

                    </div>
                  )}

                  {/* No image yet */}
                  {!capturedImage &&
                    detectionStatus === "idle" && (
                    <div className="flex min-h-[185px] flex-col justify-center rounded-xl border border-slate-200 bg-slate-50 p-4">

                      <p className="font-semibold text-slate-800">
                        Waiting for photo
                      </p>

                      <p className="mt-1.5 text-sm leading-5 text-slate-500">
                        Start the camera and capture a clear photo
                        to begin verification.
                      </p>

                    </div>
                  )}

                  {/* Loading */}
                  {detectionStatus === "loading" && (
                    <div
                      role="status"
                      className="flex min-h-[185px] flex-col justify-center rounded-xl border border-blue-200 bg-blue-50 p-4"
                    >
                      <p className="font-semibold text-blue-900">
                        Preparing face detection
                      </p>

                      <p className="mt-1.5 text-sm leading-5 text-blue-700">
                        Loading the face detection model...
                      </p>
                    </div>
                  )}

                  {/* Detecting */}
                  {detectionStatus === "detecting" && (
                    <div
                      role="status"
                      className="flex min-h-[185px] flex-col justify-center rounded-xl border border-blue-200 bg-blue-50 p-4"
                    >
                      <p className="font-semibold text-blue-900">
                        Checking your photo
                      </p>

                      <p className="mt-1.5 text-sm leading-5 text-blue-700">
                        Detecting faces in the captured image...
                      </p>
                    </div>
                  )}

                  {/* One face */}
                  {detectionStatus === "detected" && (
                    <div
                      role="status"
                      className="flex min-h-[185px] flex-col justify-center rounded-xl border border-emerald-200 bg-emerald-50 p-4"
                    >

                      <div className="flex items-center justify-between gap-3">

                        <p className="font-semibold text-emerald-900">
                          ✓ One face detected
                        </p>

                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          Face count: {faceCount}
                        </span>

                      </div>

                      <p className="mt-2 text-sm leading-5 text-emerald-700">
                        Exactly one face was detected.
                        You can proceed to the next verification
                        stage.
                      </p>

                      {verificationStatus === "passed" &&
                        canProceed && (
                          <p className="mt-2 text-xs font-medium leading-5 text-emerald-800">
                            {verificationMessage}
                          </p>
                        )}

                    </div>
                  )}

                  {/* No face */}
                  {detectionStatus === "not-detected" && (
                    <div
                      role="alert"
                      className="flex min-h-[185px] flex-col justify-center rounded-xl border border-amber-200 bg-amber-50 p-4"
                    >

                      <div className="flex items-center justify-between gap-3">

                        <p className="font-semibold text-amber-900">
                          ⚠ No face detected
                        </p>

                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          Face count: 0
                        </span>

                      </div>

                      <p className="mt-2 text-sm leading-5 text-amber-800">
                        We could not detect a face in the captured
                        image.
                      </p>

                      <p className="mt-2 text-sm font-medium leading-5 text-amber-900">
                        Please retake the photo and make sure your
                        face is clearly visible.
                      </p>

                    </div>
                  )}

                  {/* Multiple faces */}
                  {detectionStatus === "multiple-faces" && (
                    <div
                      role="alert"
                      className="flex min-h-[185px] flex-col justify-center rounded-xl border border-red-200 bg-red-50 p-4"
                    >

                      <div className="flex items-center justify-between gap-3">

                        <p className="font-semibold text-red-900">
                          ⚠ Multiple faces detected
                        </p>

                        <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                          {faceCount} faces
                        </span>

                      </div>

                      <p className="mt-2 text-sm leading-5 text-red-800">
                        More than one person was detected in the
                        captured image.
                      </p>

                      <p className="mt-2 text-sm font-medium leading-5 text-red-900">
                        Please make sure nobody else is visible
                        and retake the photo.
                      </p>

                    </div>
                  )}

                  {/* Detection error */}
                  {detectionStatus === "error" && (
                    <div
                      role="alert"
                      className="flex min-h-[185px] flex-col justify-center rounded-xl border border-red-200 bg-red-50 p-4"
                    >

                      <p className="font-semibold text-red-900">
                        Face detection failed
                      </p>

                      <p className="mt-1.5 text-sm leading-5 text-red-700">
                        {detectionError ??
                          "Face detection could not be completed. Please try again."}
                      </p>

                    </div>
                  )}

                </div>

              </div>

              {/* =================================================
                  PRIVACY NOTICE
              ================================================= */}
              <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4">

                <p className="text-sm font-bold text-slate-900">
                  Privacy Notice
                </p>

                <div className="mt-2.5 space-y-1.5 text-xs leading-5 text-slate-600">

                  <p>
                    <span className="font-semibold text-slate-800">
                      Purpose:
                    </span>{" "}
                    {facePrivacyPolicy.capturePurpose}
                  </p>

                  <p>
                    <span className="font-semibold text-slate-800">
                      Processing:
                    </span>{" "}
                    {facePrivacyPolicy.processingLocation}
                  </p>

                  <p>
                    <span className="font-semibold text-slate-800">
                      Storage:
                    </span>{" "}
                    {facePrivacyPolicy.rawImageStorage}
                  </p>

                  <p>
                    <span className="font-semibold text-slate-800">
                      Upload:
                    </span>{" "}
                    {facePrivacyPolicy.serverUpload}
                  </p>

                  <p>
                    <span className="font-semibold text-slate-800">
                      Identity verification:
                    </span>{" "}
                    {facePrivacyPolicy.identityVerification}
                  </p>

                </div>

              </div>

            </aside>

          </div>

        </div>

      </section>

    </main>
  );
}