// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA3HE6VHYG5iatSpt-texs5VbBP4waytiU",
  authDomain: "swayam-website-d9b3d.firebaseapp.com",
  databaseURL: "https://swayam-website-d9b3d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "swayam-website-d9b3d",
  storageBucket: "swayam-website-d9b3d.appspot.com",
  messagingSenderId: "904391659227",
  appId: "1:904391659227:web:6dd753f9ae4f3f8f8246fe",
  measurementId: "G-LXDKH449TG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);