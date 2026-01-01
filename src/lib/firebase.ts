import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getDatabase, type Database } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAYzzwkqZjf5iWN6Pc4wSz6MYJAzAFJ0wA",
  authDomain: "gmae111.firebaseapp.com",
  projectId: "gmae111",
  storageBucket: "gmae111.firebasestorage.app",
  messagingSenderId: "223415325596",
  appId: "1:223415325596:web:272fd4d7aff74d33b3ee59",
  measurementId: "G-4TEGC1REF4",
  databaseURL:
    "https://gmae111-default-rtdb.asia-southeast1.firebasedatabase.app",
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize services
export const auth: Auth = getAuth(app);
export const database: Database = getDatabase(app);

export default app;
