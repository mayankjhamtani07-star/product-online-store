import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyBbeYbHPQpsUmLfcePmOUK75aepoHF_7Jo",
    authDomain: "ticket-system-4550e.firebaseapp.com",
    projectId: "ticket-system-4550e",
    storageBucket: "ticket-system-4550e.firebasestorage.app",
    messagingSenderId: "811134532906",
    appId: "1:811134532906:web:7c0b0820c1d1a8a38bb253",
    measurementId: "G-T512J19WTF"
};
 
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const messaging = getMessaging(app);