import { useState, useMemo } from 'react'
import styles from './StudyPage.module.css'
import { todayStr, getItemsForDate, getReviewDates } from '../storage.js'

const REVIEW_LABELS = ['初次学习', '第1次复习', '第2次复习', '第3次复习', '第4次复习', '第5次复习', '第6次复习']

function fisherYatesShuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function StudyPage({ child, onBack }) {
  const today = todayStr()
  const originalItems = useMemo(() => getItemsForDate(child.items, today), [child.items, today])

  const [index, setIndex] = useState(0)
  const [done, setDone] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)
  const [isShuffled, setIsShuffled] = useState(false)
  const [shuffledItems, setShuffledItems] = useState([])

  const items = isShuffled ? shuffledItems : originalItems
  const total = items.length
  const item = items[index] || null

  function handleToggleShuffle() {
    if (!isShuffled) {
      setShuffledItems(fisherYatesShuffle(originalItems))
      setIsShuffled(true)
    } else {
      setIsShuffled(false)
    }
    setIndex(0)
    setDone(false)
  }

  function handlePrev() {
    if (index > 0) setIndex(i => i - 1)
  }

  function handleNext() {
    if (index + 1 >= total) {
      setDone(true)
    } else {
      setIndex(i => i + 1)
    }
  }

  function handleRestart() {
    setIndex(0)
    setDone(false)
  }

  if (total === 0) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <button className={styles.backHeaderBtn} onClick={onBack}>← 退出</button>
        </header>
        <div className={styles.emptyStudy}>
          <div className={styles.emptyIcon}>🎉</div>
          <p className={styles.emptyText}>今天没有需要复习的内容</p>
          <button className={styles.backBtn} onClick={onBack}>返回</button>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className={styles.page}>
        <div className={styles.doneCard}>
          <div className={styles.doneEmoji}>🎉</div>
          <h2 className={styles.doneTitle}>太棒了，{child.name}！</h2>
          <p className={styles.doneText}>今天的 <strong>{total}</strong> 条内容全部复习完成！</p>
          <div className={styles.doneBtns}>
            <button
              className={styles.restartBtn}
              style={{ background: child.color }}
              onClick={handleRestart}
            >
              再来一遍
            </button>
            <button className={styles.backBtn} onClick={onBack}>
              查看全部内容
            </button>
            <button className={styles.backBtnAlt} onClick={onBack}>
              返回
            </button>
          </div>
        </div>
      </div>
    )
  }

  const reviewDates = item ? getReviewDates(item.startDate) : []
  const reviewIndex = reviewDates.indexOf(today)
  const reviewLabel = reviewIndex >= 0 ? REVIEW_LABELS[reviewIndex] : ''
  const progressPercent = ((index + 1) / total) * 100

  return (
    <div className={styles.page}>
      {showOverlay && (
        <div className={styles.overlay}>
          <div className={styles.overlayInner}>
            <div className={styles.overlayHeader}>
              <span className={styles.overlayTitle}>今天全部内容</span>
              <button className={styles.overlayClose} onClick={() => setShowOverlay(false)}>✕</button>
            </div>
            <div className={styles.overlayList}>
              {items.map((it, i) => {
                const rd = getReviewDates(it.startDate)
                const ri = rd.indexOf(today)
                const rl = ri >= 0 ? REVIEW_LABELS[ri] : ''
                return (
                  <div key={it.id} className={`${styles.overlayItem} ${i === index ? styles.overlayItemActive : ''}`}>
                    <div className={styles.overlayItemHeader}>
                      <span className={styles.overlayNum}>#{it.number}</span>
                      <span className={styles.overlayReviewLabel}>{rl}</span>
                    </div>
                    <p className={styles.overlayItemTitle}>{it.title}</p>
                    <p className={styles.overlayItemContent}>{it.content}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <header className={styles.header}>
        <button className={styles.backHeaderBtn} onClick={onBack}>← 退出</button>
        <div className={styles.progressWrap}>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressBar}
              style={{ width: `${progressPercent}%`, background: child.color }}
            />
          </div>
          <div className={styles.dots}>
            {items.map((_, i) => (
              <div
                key={i}
                className={`${styles.dot} ${i === index ? styles.dotActive : ''} ${i < index ? styles.dotDone : ''}`}
                style={i === index ? { background: child.color } : {}}
              />
            ))}
          </div>
        </div>
        <span className={styles.progressText}>{index + 1} / {total}</span>
        <button
          className={styles.testBtn}
          style={{ borderColor: child.color, color: child.color }}
          onClick={() => setShowOverlay(true)}
        >
          测试
        </button>
        <button
          className={`${styles.shuffleBtn} ${isShuffled ? styles.shuffleBtnActive : ''}`}
          style={isShuffled ? { background: child.color, borderColor: child.color, color: 'white' } : { borderColor: child.color, color: child.color }}
          onClick={handleToggleShuffle}
          title={isShuffled ? '取消随机' : '随机排序'}
        >
          🔀
        </button>
      </header>

      <main className={styles.main}>
        <div className={styles.flashcard} key={item.id}>
          <div className={styles.cardMeta}>
            <span className={styles.cardNum}>#{item.number}</span>
            <span className={styles.cardReviewLabel}>{reviewLabel}</span>
          </div>
          <h2 className={styles.cardTitle}>{item.title}</h2>
          <div className={styles.cardContent}>
            <p className={styles.cardText}>{item.content}</p>
          </div>
        </div>

        <div className={styles.navRow}>
          <button
            className={`${styles.navBtn} ${index === 0 ? styles.navBtnDisabled : ''}`}
            onClick={handlePrev}
            disabled={index === 0}
          >
            ◀ 上一条
          </button>
          <button
            className={styles.nextBtn}
            style={{ background: child.color }}
            onClick={handleNext}
          >
            {index + 1 >= total ? '完成 🎉' : '下一条 ▶'}
          </button>
        </div>
      </main>
    </div>
  )
}
