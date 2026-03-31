// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDwJr2cA9yjEZI3X-1t1gr4MMnSeJjBO14",
  authDomain: "casamentopresenca2026.firebaseapp.com",
  databaseURL: "https://casamentopresenca2026-default-rtdb.firebaseio.com",
  projectId: "casamentopresenca2026",
  storageBucket: "casamentopresenca2026.firebasestorage.app",
  messagingSenderId: "129356468488",
  appId: "1:129356468488:web:e0a573abba122b74465cbd"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);