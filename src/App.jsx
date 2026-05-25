import { useState, useEffect, useCallback } from 'react'
import { loadData, saveData, addChild, deleteChild, addCard, deleteCard, incrementReview } from './storage.js'
import HomePage from './pages/HomePage.jsx'
import ChildPage from './pages/ChildPage.jsx'
import StudyPage from './pages/StudyPage.jsx'

export default function App() {
  const [data, setData] = useState(() => loadData())
  const [route, setRoute] = useState({ page: 'home', childId: null })

  useEffect(() => {
    saveData(data)
  }, [data])

  const mutate = useCallback((fn) => setData(prev => fn(prev)), [])

  const child = data.children.find(c => c.id === route.childId) || null

  return (
    <div style={{ minHeight: '100vh' }}>
      {route.page === 'home' && (
        <HomePage
          children={data.children}
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
          onAddCard={(title, text) => mutate(d => addCard(d, child.id, title, text))}
          onDeleteCard={cardId => mutate(d => deleteCard(d, child.id, cardId))}
        />
      )}
      {route.page === 'study' && child && (
        <StudyPage
          child={child}
          onBack={() => setRoute({ page: 'child', childId: child.id })}
          onReview={cardId => mutate(d => incrementReview(d, child.id, cardId))}
        />
      )}
    </div>
  )
}
