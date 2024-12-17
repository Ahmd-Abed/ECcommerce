// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBDNUk4ObX-6PwLy0GJBwgDe9oY0qP0o7I",
  authDomain: "ecommerce-8390f.firebaseapp.com",
  projectId: "ecommerce-8390f",
  storageBucket: "ecommerce-8390f.firebasestorage.app",
  messagingSenderId: "256396393090",
  appId: "1:256396393090:web:4d06ed13d06ad14f81129b",
  measurementId: "G-J09E8968PG",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;

//const analytics = getAnalytics(app);
