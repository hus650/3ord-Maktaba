const firebaseConfig = {
  apiKey: "AIzaSyBlON5-Q5zurGIGKTnqX6JuYUA1ZgH5_8A",
  authDomain: "ord-makaba.firebaseapp.com",
  projectId: "ord-makaba",
  storageBucket: "ord-makaba.firebasestorage.app",
  messagingSenderId: "435641213860",
  appId: "1:435641213860:web:636b9c0bbcaa72ef0cd731"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
