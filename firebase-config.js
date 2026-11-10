// ضع إعدادات Firebase الخاصة بك هنا (Firebase ayarlarını buraya yapıştır)
const firebaseConfig = {
  apiKey: "BURAYA",
  authDomain: "BURAYA",
  projectId: "BURAYA",
  appId: "BURAYA"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
