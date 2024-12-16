// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCn0E_fPZpAVRZIsoTJ9fbv5g-0acmqsFk",
    authDomain: "todolist-6a8fe.firebaseapp.com",
    databaseURL: "https://todolist-6a8fe-default-rtdb.firebaseio.com",
    projectId: "todolist-6a8fe",
    storageBucket: "todolist-6a8fe.firebasestorage.app",
    messagingSenderId: "6541689886",
    appId: "1:6541689886:web:3de714fe5d31bd63101a0f",
    measurementId: "G-8H7GL6K21M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export {db}