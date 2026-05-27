import firebaseConfig from './firebaseConfig.js'
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// isConfigured = true only if all values don't start with "YOUR_"
export const isConfigured = Object.values(firebaseConfig).every(
  v => typeof v === 'string' && !v.startsWith('YOUR_')
)

export let app = null
export let auth = null
export let db = null
export let googleProvider = null

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
    googleProvider = new GoogleAuthProvider()
  } catch {
    // silently fail — app works in guest mode
    app = null
    auth = null
    db = null
    googleProvider = null
  }
}
