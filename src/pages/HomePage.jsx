import { useState } from 'react'
import styles from './HomePage.module.css'
import { AVATAR_COLORS } from '../storage.js'

export default function HomePage({ children, onSelectChild, onAddChild, onDeleteChild }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(null)

  function handleAdd(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) { setError('Please enter a name!'); return }
    if (children.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('That name already exists!')
      return
    }
    onAddChild(trimmed)
    setName('')
    setError('')
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoEmoji}>🧠</span>
          <div>
            <h1 className={styles.title}>Memory Helper</h1>
            <p className={styles.subtitle}>Learn &amp; Remember with Fun!</p>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.addSection}>
          <h2 className={styles.sectionTitle}>Who's learning today?</h2>
          <form className={styles.addForm} onSubmit={handleAdd}>
            <input
              className={styles.nameInput}
              type="text"
              placeholder="Enter child's name..."
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              maxLength={30}
            />
            <button className={styles.addBtn} type="submit">
              + Add
            </button>
          </form>
          {error && <p className={styles.error}>{error}</p>}
        </section>

        {children.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIllustration}>🌟</div>
            <p>No learners yet — add the first name above!</p>
          </div>
        ) : (
          <section className={styles.childrenSection}>
            <h2 className={styles.sectionTitle}>Choose a learner</h2>
            <div className={styles.grid}>
              {children.map((child, i) => (
                <div
                  key={child.id}
                  className={styles.card}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {deleting === child.id ? (
                    <div className={styles.confirmDelete}>
                      <p>Remove <strong>{child.name}</strong>?</p>
                      <div className={styles.confirmBtns}>
                        <button
                          className={styles.confirmYes}
                          onClick={() => { onDeleteChild(child.id); setDeleting(null) }}
                        >
                          Yes, remove
                        </button>
                        <button
                          className={styles.confirmNo}
                          onClick={() => setDeleting(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => setDeleting(child.id)}
                        title="Remove learner"
                      >
                        ✕
                      </button>
                      <button
                        className={styles.cardInner}
                        onClick={() => onSelectChild(child.id)}
                      >
                        <div
                          className={styles.avatar}
                          style={{ background: child.color }}
                        >
                          {child.name.charAt(0).toUpperCase()}
                        </div>
                        <span className={styles.childName}>{child.name}</span>
                        <span className={styles.cardCount}>
                          {child.items.length} 个内容
                        </span>
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
