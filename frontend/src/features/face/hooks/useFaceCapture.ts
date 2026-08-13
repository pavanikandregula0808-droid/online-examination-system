import { useCallback, useRef, useState } from "react";

interface UseFaceCaptureResult {
  capturedImage: string | null;
  captureFrame: () => boolean;
  retake: () => void;
}

export function useFaceCapture(
  videoRef: React.RefObject<HTMLVideoElement | null>,
): UseFaceCaptureResult {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;

    if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      return false;
    }

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      return false;
    }

    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }

    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      return false;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9);

    setCapturedImage(imageDataUrl);

    return true;
  }, [videoRef]);

  const retake = useCallback(() => {
    setCapturedImage(null);
  }, []);

  return {
    capturedImage,
    captureFrame,
    retake,
  };
}