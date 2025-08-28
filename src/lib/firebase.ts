import { initializeApp, getApps, App } from "firebase-admin/app";
import { credential } from "firebase-admin";

// Ensure you have the serviceAccountKey.json file at your project root
// and your GOOGLE_APPLICATION_CREDENTIALS environment variable is set correctly.
// For local development, you might use a .env.local file.

const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS
  ? require(process.cwd() + "/" + process.env.GOOGLE_APPLICATION_CREDENTIALS)
  : {};

export function initializeFirebase(): App {
  const apps = getApps();
  if (apps.length) {
    return apps[0];
  }

  return initializeApp({
    credential: credential.cert(serviceAccount),
  });
}
