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
  // For local development, you can set FIREBASE_CREDENTIALS in .env.local
  // to the JSON string of your service account key.
  const serviceAccount = process.env.FIREBASE_CREDENTIALS 
    ? JSON.parse(process.env.FIREBASE_CREDENTIALS) 
    : undefined;

  app = initializeApp({
    credential: serviceAccount ? credential.cert(serviceAccount) : credential.applicationDefault(),
  });

  return app;
}
