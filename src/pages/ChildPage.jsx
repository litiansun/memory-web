import { useState } from 'react'
import styles from './ChildPage.module.css'

export default function ChildPage({ child, onBack, onStudy, onAddCard, onDeleteCard }) {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [justAdded, setJustAdded] = useState(null)

  function handleAdd(e) {
    e.preventDefault()
    if (!title.trim()) { setError('Please add a title!'); return }
    if (!text.trim())  { setError('Please add some text!'); return }
    onAddCard(title, text)
    setJustAdded(title.trim())
    setTitle('')
    setText('')
    setError('')
    setShowForm(false)
    setTimeout(() => setJustAdded(null), 2000)
  }

  return (
    <div className={styles.page}>
      <header className={styles.header} style={{ '--child-color': child.color }}>
        <button className={styles.backBtn} onClick={onBack}>← Back</button>
        <div className={styles.childInfo}>
          <div className={styles.avatar} style={{ background: child.color }}>
            {child.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className={styles.childName}>{child.name}'s Cards</h1>
            <p className={styles.cardCount}>{child.cards.length} memorization card{child.cards.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        {child.cards.length > 0 && (
          <button className={styles.studyBtn} onClick={onStudy}>
            ✨ Study
          </button>
        )}
      </header>

      <main className={styles.main}>
        {/* Add Card Toggle */}
        <button
          className={styles.addToggle}
          style={{ background: child.color }}
          onClick={() => setShowForm(f => !f)}
        >
          {showForm ? '✕ Cancel' : '+ New Card'}
        </button>

        {/* Add Card Form */}
        {showForm && (
          <form className={`${styles.form} animate-bounce-in`} onSubmit={handleAdd}>
            <h2 className={styles.formTitle}>Add a New Memory Card</h2>
            <label className={styles.label}>Title</label>
            <input
              className={styles.input}
              type="text"
              placeholder="e.g. The Solar System"
              value={title}
              onChange={e => { setTitle(e.target.value); setError('') }}
              maxLength={80}
              autoFocus
            />
            <label className={styles.label}>Content to memorize</label>
            <textarea
              className={styles.textarea}
              placeholder="e.g. The eight planets are: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune."
              value={text}
              onChange={e => { setText(e.target.value); setError('') }}
              rows={5}
              maxLength={2000}
            />
            {error && <p className={styles.error}>{error}</p>}
            <button
              className={styles.submitBtn}
              style={{ background: child.color }}
              type="submit"
            >
              Save Card
            </button>
          </form>
        )}

        {justAdded && (
          <div className={styles.toast}>Card "{justAdded}" added!</div>
        )}

        {/* Cards List */}
        {child.cards.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📝</div>
            <p>No cards yet — add the first one above!</p>
          </div>
        ) : (
          <div className={styles.cardList}>
            {child.cards.map((card, i) => (
              <div
                key={card.id}
                className={`${styles.memCard} ${expanded === card.id ? styles.memCardExpanded : ''}`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className={styles.memCardHeader}>
                  <button
                    className={styles.memCardTitle}
                    onClick={() => setExpanded(expanded === card.id ? null : card.id)}
                  >
                    <span className={styles.memCardIcon}>📖</span>
                    <span>{card.title}</span>
                    <span className={styles.chevron}>
                      {expanded === card.id ? '▲' : '▼'}
                    </span>
                  </button>
                  {deleting !== card.id && (
                    <button
                      className={styles.deleteBtn}
                      onClick={() => setDeleting(card.id)}
                      title="Delete card"
                    >
                      🗑
                    </button>
                  )}
                </div>

                {expanded === card.id && (
                  <div className={styles.memCardBody}>
                    <p className={styles.memCardText}>{card.text}</p>
                    {card.reviewCount > 0 && (
                      <p className={styles.reviewBadge}>
                        Reviewed {card.reviewCount}×
                      </p>
                    )}
                  </div>
                )}

                {deleting === card.id && (
                  <div className={styles.confirmRow}>
                    <span>Delete this card?</span>
                    <button
                      className={styles.confirmYes}
                      onClick={() => { onDeleteCard(card.id); setDeleting(null); setExpanded(null) }}
                    >
                      Delete
                    </button>
                    <button
                      className={styles.confirmNo}
                      onClick={() => setDeleting(null)}
                    >
                      Keep
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
