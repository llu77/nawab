import { initializeApp, getApps, App } from "firebase-admin/app";
import { credential } from "firebase-admin";

let app: App;

export function initializeFirebase(): App {
  if (app) {
    return app;
  }
  
  const apps = getApps();
  if (apps.length) {
    app = apps[0];
    return app;
  }

  // In a deployed environment, GOOGLE_APPLICATION_CREDENTIALS will be set.
  // For local development, you can set FIREBASE_CREDENTIALS in .env
  // to the JSON string of your service account key.
  const serviceAccountString = process.env.FIREBASE_CREDENTIALS;
  
  let serviceAccount;
  if (serviceAccountString) {
    try {
      serviceAccount = JSON.parse(serviceAccountString);
    } catch (e) {
      console.error("Failed to parse FIREBASE_CREDENTIALS. Make sure it's a valid JSON string.", e);
    }
  }


  app = initializeApp({
    credential: serviceAccount ? credential.cert(serviceAccount) : credential.applicationDefault(),
  });

  return app;
}
