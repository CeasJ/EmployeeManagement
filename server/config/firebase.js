const { initializeApp } = require("firebase/app");
const { errorHandler } = require("./helpers");
const { getFirestore } = require("firebase/firestore");


const firebaseConfig = {
  apiKey: process.env.FIREBSE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

let app;
let firestoreDb;

const initializeFirebaseApp = () => {
    try {
        app = initializeApp(firebaseConfig);
        firestoreDb = getFirestore();
        return app;
    } catch (error) {
        errorHandler(error, "firebase-initalizeFirebaseApp")
    }
};

const getFirebaseApp = () => app;

module.exports = {
    initializeFirebaseApp,
    getFirebaseApp
}