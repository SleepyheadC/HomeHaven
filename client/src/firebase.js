// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "homehaven-e1d3e.firebaseapp.com",
  projectId: "homehaven-e1d3e",
  storageBucket: "homehaven-e1d3e.appspot.com",
  messagingSenderId: "446559051912",
  appId: "1:446559051912:web:a488cd8975492d2ed03f3d",
  measurementId: "G-F701KV8FYL"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);