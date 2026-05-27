import { useState, useEffect, useCallback } from 'react'
import { loadData, saveData, addChild, deleteChild, addItem, updateItem, deleteItem, bulkAddItems } from './storage.js'
import { isConfigured, auth } from './firebase.js'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { loadFromFirestore, syncToFirestore } from './db.js'
import HomePage from './pages/HomePage.jsx'
import ChildPage from './pages/ChildPage.jsx'
import StudyPage from './pages/StudyPage.jsx'
import LoginPage from './pages/LoginPage.jsx'

export default function App() {
  // user: undefined = loading, null = not logged in, object = logged in
  const [user, setUser] = useState(undefined)
  const [guestMode, setGuestMode] = useState(!isConfigured)
  const [data, setData] = useState(() => loadData())
  const [route, setRoute] = useState({ page: 'home', childId: null })

  // Set up Firebase auth listener
  useEffect(() => {
    if (!isConfigured || !auth) {
      // No Firebase — skip auth entirely, go straight to guest/home
      setUser(null)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Load cloud data on sign-in
        try {
          const cloudData = await loadFromFirestore(firebaseUser.uid)
          if (cloudData) {
            setData(cloudData)
            saveData(cloudData)
          } else {
            // No cloud data — push local data up
            syncToFirestore(firebaseUser.uid, data)
          }
        } catch {
          // silently ignore
        }
        setUser(firebaseUser)
      } else {
        setUser(null)
      }
    })

    return () => unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Save to localStorage on every data change
  useEffect(() => {
    saveData(data)
  }, [data])

  // Sync to Firestore on data change when logged in
  useEffect(() => {
    if (user && user.uid) {
      syncToFirestore(user.uid, data)
    }
  }, [data, user])

  const mutate = useCallback((fn) => setData(prev => fn(prev)), [])

  async function handleSignOut() {
    if (auth) {
      try {
        await signOut(auth)
      } catch {
        // silently ignore
      }
    }
    setUser(null)
    setGuestMode(!isConfigured)
  }

  function handleSignIn() {
    // Called from HomePage "登录同步" button — exit guest mode to show login page
    setGuestMode(false)
  }

  const child = data.children.find(c => c.id === route.childId) || null

  // Loading state while auth resolves
  if (user === undefined) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fef9f0 0%, #fce4ec 50%, #e8f5e9 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '64px'
      }}>
        🧠
      </div>
    )
  }

  // Show login if not logged in and not in guest mode
  if (user === null && !guestMode) {
    return (
      <LoginPage onGuestMode={() => setGuestMode(true)} />
    )
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {route.page === 'home' && (
        <HomePage
          children={data.children}
          user={user}
          guestMode={guestMode}
          isConfigured={isConfigured}
          onSignOut={handleSignOut}
          onSignIn={handleSignIn}
          onSelectChild={childId => setRoute({ page: 'child', childId })}
          onAddChild={name => mutate(d => addChild(d, name))}
          onDeleteChild={childId => {
            mutate(d => deleteChild(d, childId))
            if (route.childId === childId) setRoute({ page: 'home', childId: null })
          }}
        />
      )}
      {route.page === 'child' && child && (
        <ChildPage
          child={child}
          onBack={() => setRoute({ page: 'home', childId: null })}
          onStudy={() => setRoute({ page: 'study', childId: child.id })}
          onAddItem={(payload) => mutate(d => addItem(d, child.id, payload))}
          onUpdateItem={(itemId, payload) => mutate(d => updateItem(d, child.id, itemId, payload))}
          onDeleteItem={(itemId) => mutate(d => deleteItem(d, child.id, itemId))}
          onBulkAddItems={(items) => mutate(d => bulkAddItems(d, child.id, items))}
        />
      )}
      {route.page === 'study' && child && (
        <StudyPage
          child={child}
          onBack={() => setRoute({ page: 'child', childId: child.id })}
        />
      )}
    </div>
  )
}
