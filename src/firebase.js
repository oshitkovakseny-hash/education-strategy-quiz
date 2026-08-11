import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

// TEMPORARILY points at an unrelated Firebase project (my-calendar-sync-b88cd),
// just so the app works out of the box without extra setup — this landing
// page has nothing to do with it. Replace with your own Firebase project's
// config (see README.md, "Emailing the results" section). The values below
// are Firebase's public client config, not a secret; access to the data is
// controlled by Firestore security rules, not by hiding these values.
const firebaseConfig = {
  apiKey: "AIzaSyDhfu5fKnbaTA2aZYR7lekcSyEK0GbuYPQ",
  authDomain: "my-calendar-sync-b88cd.firebaseapp.com",
  projectId: "my-calendar-sync-b88cd",
  storageBucket: "my-calendar-sync-b88cd.firebasestorage.app",
  messagingSenderId: "965264661098",
  appId: "1:965264661098:web:98e1708bb97f84f8288813",
};

let app, db;
try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (e) {
  console.warn("Firebase is not configured:", e.message);
}

export const isFirebaseConfigured = () => !!db;

// Saves the quiz answers and result to the quiz_submissions collection.
export async function saveSubmission(data) {
  if (!db) return null;
  const ref = await addDoc(collection(db, "quiz_submissions"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

// Queues the email in the mail collection — read by the Firebase
// "Trigger Email from Firestore" extension, which sends it through
// whatever SMTP is configured in the extension. Without the extension
// installed, the document just sits in the database and nothing gets
// sent — see README.md.
export async function queueResultEmail({ to, subject, html }) {
  if (!db) return null;
  const ref = await addDoc(collection(db, "mail"), {
    to: [to],
    message: { subject, html },
    createdAt: serverTimestamp(),
  });
  return ref.id;
}
