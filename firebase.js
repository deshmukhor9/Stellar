// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxE-C-oR_RrbW9OX6PF_QoUPgfxRwW730",
  authDomain: "stellar-eb618.firebaseapp.com",
  projectId: "stellar-eb618",
  storageBucket: "stellar-eb618.appspot.com",
  messagingSenderId: "293547971033",
  appId: "1:293547971033:web:9993b2e372cf8fb87949c8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// const auth = getAuth(app);
const storage = getStorage(app);
// const analytics = getAnalytics(app);

export { db };