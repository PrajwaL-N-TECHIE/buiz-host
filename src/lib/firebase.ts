import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

export const googleProvider = new GoogleAuthProvider();

export const firebaseConfig = {
  apiKey: "AIzaSyDgrnbifK4MfZCjeieBZmXRzerGTHSvh8o",
  authDomain: "buildicy-internships.firebaseapp.com",
  projectId: "buildicy-internships",
  storageBucket: "buildicy-internships.firebasestorage.app",
  messagingSenderId: "147546049319",
  appId: "1:147546049319:web:3e45f7973cbcee7f88f702",
  measurementId: "G-PE6NBGDL8K"
};

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true,
  experimentalAutoDetectLongPolling: true,
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});
export const auth = getAuth(app);
