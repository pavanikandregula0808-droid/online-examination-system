export interface FacePrivacyPolicy {
  capturePurpose: string;
  processingLocation: string;
  rawImageStorage: string;
  serverUpload: string;
  identityVerification: string;
}

export const facePrivacyPolicy: FacePrivacyPolicy = {
  capturePurpose:
    "Capture a face image for the examination identity-verification workflow.",

  processingLocation:
    "Face detection is currently performed in the candidate's browser.",

  rawImageStorage:
    "The current frontend does not permanently store captured face images.",

  serverUpload:
    "The current frontend does not upload captured face images to a server.",

  identityVerification:
    "Actual identity verification against a reference identity is not implemented yet.",
};