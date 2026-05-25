import { useState } from 'react'
import styles from './StudyPage.module.css'

export default function StudyPage({ child, onBack, onReview }) {
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [done, setDone] = useState(false)
  const [reviewed, setReviewed] = useState(0)

  const cards = child.cards
  const card = cards[index]
  const total = cards.length

  function handleReveal() {
    setRevealed(true)
    onReview(card.id)
    setReviewed(r => r + 1)
  }

  function handleNext() {
    if (index + 1 >= total) {
      setDone(true)
    } else {
      setIndex(i => i + 1)
      setRevealed(false)
    }
  }

  function handlePrev() {
    if (index > 0) {
      setIndex(i => i - 1)
      setRevealed(false)
    }
  }

  function handleRestart() {
    setIndex(0)
    setRevealed(false)
    setDone(false)
    setReviewed(0)
  }

  if (done) {
    return (
      <div className={styles.page}>
        <div className={styles.doneCard}>
          <div className={styles.doneEmoji}>🎉</div>
          <h2 className={styles.doneTitle}>Amazing job, {child.name}!</h2>
          <p className={styles.doneText}>
            You studied all <strong>{total}</strong> cards!
          </p>
          <div className={styles.doneBtns}>
            <button
              className={styles.restartBtn}
              style={{ background: child.color }}
              onClick={handleRestart}
            >
              Study Again
            </button>
            <button className={styles.backBtn} onClick={onBack}>
              Back to Cards
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backHeaderBtn} onClick={onBack}>← Exit</button>
        <div className={styles.progress}>
          <div
            className={styles.progressBar}
            style={{
              width: `${((index + (revealed ? 1 : 0)) / total) * 100}%`,
              background: child.color,
            }}
          />
        </div>
        <span className={styles.progressText}>{index + 1} / {total}</span>
      </header>

      <main className={styles.main}>
        <div
          className={`${styles.flashcard} ${revealed ? styles.revealed : ''}`}
          key={card.id}
        >
          <div className={styles.cardLabel}>
            {revealed ? 'Read & Remember:' : 'What do you know about...'}
          </div>
          <h2 className={styles.cardTitle}>{card.title}</h2>

          {revealed ? (
            <div className={styles.cardContent}>
              <p className={styles.cardText}>{card.text}</p>
            </div>
          ) : (
            <button
              className={styles.revealBtn}
              style={{ background: child.color }}
              onClick={handleReveal}
            >
              Show me! ✨
            </button>
          )}
        </div>

        {revealed && (
          <div className={styles.navRow}>
            {index > 0 && (
              <button className={styles.navBtn} onClick={handlePrev}>
                ← Previous
              </button>
            )}
            <button
              className={styles.nextBtn}
              style={{ background: child.color }}
              onClick={handleNext}
            >
              {index + 1 >= total ? 'Finish! 🎉' : 'Next →'}
            </button>
          </div>
        )}

        <div className={styles.dots}>
          {cards.map((_, i) => (
            <div
              key={i}
              className={`${styles.dot} ${i === index ? styles.dotActive : ''} ${i < index ? styles.dotDone : ''}`}
              style={i === index ? { background: child.color } : {}}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
