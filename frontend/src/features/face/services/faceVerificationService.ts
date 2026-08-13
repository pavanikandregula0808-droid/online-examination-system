export interface FaceVerificationRequest {
  capturedImage: string;
}

export interface FaceVerificationResponse {
  verified: boolean;
  message: string;
}

/**
 * Face verification service boundary.
 *
 * IMPORTANT:
 * This function does not perform identity verification yet.
 * The current project does not have a backend or reference identity
 * system to compare the captured face against.
 *
 * This service exists so the UI can later connect to a real,
 * server-side verification implementation without coupling
 * API logic to React components.
 */
export async function verifyFaceIdentity(
  _request: FaceVerificationRequest,
): Promise<FaceVerificationResponse> {
  throw new Error(
    "Identity verification backend is not configured yet.",
  );
}