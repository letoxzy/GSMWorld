import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyAahX8uFEUnkbne9PYgGI9-0jlhG2cJF6Q",
  authDomain: "joe-best2.firebaseapp.com",
  projectId: "joe-best2",
  storageBucket: "joe-best2.firebasestorage.app",
  messagingSenderId: "185272092564",
  appId: "1:185272092564:web:5c3778eca4718e131af181",
  measurementId: "G-Q44NM8WPJ9"
};

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const googleProvider = new GoogleAuthProvider()
export default app
