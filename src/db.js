import { db } from './firebase.js'
import { doc, getDoc, setDoc } from 'firebase/firestore'

let syncTimer = null

export async function loadFromFirestore(uid) {
  if (!db) return null
  try {
    const ref = doc(db, 'users', uid, 'appdata', 'main')
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    const raw = snap.data().json
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function syncToFirestore(uid, data) {
  if (!db) return
  if (syncTimer) clearTimeout(syncTimer)
  syncTimer = setTimeout(async () => {
    try {
      const ref = doc(db, 'users', uid, 'appdata', 'main')
      await setDoc(ref, { json: JSON.stringify(data) })
    } catch {
      // silently ignore
    }
  }, 1500)
}
