import { useState } from 'react'
import styles from './ChildPage.module.css'
import { todayStr, addDays, getReviewDates, getItemsForDate, displayDate } from '../storage.js'

const REVIEW_LABELS = ['初次学习', '第1次复习', '第2次复习', '第3次复习', '第4次复习', '第5次复习', '第6次复习']
const DATE_OFFSETS = [0, 1, 2, 3, 4]

export default function ChildPage({ child, onBack, onStudy, onAddItem, onUpdateItem, onDeleteItem }) {
  const [tab, setTab] = useState('today')
  const today = todayStr()

  return (
    <div className={styles.page}>
      <header className={styles.header} style={{ '--child-color': child.color }}>
        <div className={styles.headerTop}>
          <button className={styles.backBtn} onClick={onBack}>← 返回</button>
          <div className={styles.childInfo}>
            <div className={styles.avatar} style={{ background: child.color }}>
              {child.name.charAt(0).toUpperCase()}
            </div>
            <span className={styles.childName}>{child.name}</span>
          </div>
          <button
            className={styles.studyBtn}
            style={{ background: child.color }}
            onClick={onStudy}
          >
            ▶ 开始记忆
          </button>
        </div>
        <nav className={styles.tabBar}>
          {[
            { key: 'today', label: '今天' },
            { key: 'all', label: '全部内容' },
            { key: 'preview', label: '60天预览' },
            { key: 'add', label: '＋新内容' },
          ].map(t => (
            <button
              key={t.key}
              className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`}
              style={tab === t.key ? { color: child.color, borderColor: child.color } : {}}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className={styles.main}>
        {tab === 'today' && (
          <TodayTab child={child} today={today} />
        )}
        {tab === 'all' && (
          <AllTab child={child} today={today} onUpdateItem={onUpdateItem} onDeleteItem={onDeleteItem} />
        )}
        {tab === 'preview' && (
          <PreviewTab child={child} today={today} />
        )}
        {tab === 'add' && (
          <AddTab child={child} today={today} onAddItem={onAddItem} onDone={() => setTab('today')} />
        )}
      </main>
    </div>
  )
}

function TodayTab({ child, today }) {
  const items = getItemsForDate(child.items, today)

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🎉</div>
        <p className={styles.emptyText}>今天没有需要复习的内容</p>
        <p className={styles.emptySubtext}>去添加新内容，或明天再来！</p>
      </div>
    )
  }

  return (
    <div className={styles.todayList}>
      {items.map(item => {
        const reviewDates = getReviewDates(item.startDate)
        const reviewIndex = reviewDates.indexOf(today)
        const label = reviewIndex >= 0 ? REVIEW_LABELS[reviewIndex] : ''
        return (
          <div key={item.id} className={styles.todayCard}>
            <div className={styles.todayCardHeader}>
              <span className={styles.itemNumber}>#{item.number}</span>
              <span className={styles.reviewLabel}>{label}</span>
            </div>
            <h3 className={styles.todayTitle}>{item.title}</h3>
            <p className={styles.todayContent}>{item.content}</p>
          </div>
        )
      })}
    </div>
  )
}

function AllTab({ child, today, onUpdateItem, onDeleteItem }) {
  const [expanded, setExpanded] = useState(null)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editDate, setEditDate] = useState('')

  const sorted = [...child.items].sort((a, b) => a.number - b.number)

  function startEdit(item) {
    setEditing(item.id)
    setEditTitle(item.title)
    setEditContent(item.content)
    setEditDate(item.startDate)
  }

  function saveEdit(itemId) {
    if (!editTitle.trim() || !editContent.trim() || !editDate) return
    onUpdateItem(itemId, { title: editTitle, content: editContent, startDate: editDate })
    setEditing(null)
  }

  if (sorted.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>📚</div>
        <p className={styles.emptyText}>还没有任何内容</p>
        <p className={styles.emptySubtext}>切换到"＋新内容"添加第一条！</p>
      </div>
    )
  }

  return (
    <div className={styles.allList}>
      {sorted.map(item => {
        const reviewDates = getReviewDates(item.startDate)
        const isExpanded = expanded === item.id
        const isEditing = editing === item.id
        const isDeleting = deleting === item.id

        return (
          <div key={item.id} className={`${styles.allItem} ${isExpanded ? styles.allItemExpanded : ''}`}>
            <button
              className={styles.allItemRow}
              onClick={() => {
                if (isEditing) return
                setExpanded(isExpanded ? null : item.id)
              }}
            >
              <span className={styles.allItemNumber}>#{item.number}</span>
              <span className={styles.allItemTitle}>{item.title}</span>
              <span className={styles.allItemChevron}>{isExpanded ? '▲' : '▼'}</span>
            </button>

            {isExpanded && !isEditing && (
              <div className={styles.allItemBody}>
                <p className={styles.allItemContent}>{item.content}</p>

                <div className={styles.reviewDatesSection}>
                  <p className={styles.reviewDatesHeading}>学习日期</p>
                  <div className={styles.reviewDatesList}>
                    {reviewDates.map((date, idx) => {
                      const isPast = date < today
                      const isToday = date === today
                      return (
                        <div key={idx} className={styles.reviewDateRow}>
                          <span className={styles.reviewDateLabel}>{REVIEW_LABELS[idx]}</span>
                          <span className={styles.reviewDateValue}>{displayDate(date)}</span>
                          {isPast && <span className={styles.reviewDateCheck}>✓</span>}
                          {isToday && <span className={styles.reviewDateToday}>今天</span>}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {isDeleting ? (
                  <div className={styles.confirmRow}>
                    <span className={styles.confirmText}>确定删除这条内容？</span>
                    <button
                      className={styles.confirmYes}
                      onClick={() => { onDeleteItem(item.id); setDeleting(null); setExpanded(null) }}
                    >
                      删除
                    </button>
                    <button
                      className={styles.confirmNo}
                      onClick={() => setDeleting(null)}
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <div className={styles.itemActions}>
                    <button className={styles.editBtn} onClick={() => startEdit(item)}>编辑</button>
                    <button className={styles.deleteBtn} onClick={() => setDeleting(item.id)}>删除</button>
                  </div>
                )}
              </div>
            )}

            {isExpanded && isEditing && (
              <div className={styles.editForm}>
                <label className={styles.editLabel}>标题</label>
                <input
                  className={styles.editInput}
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  maxLength={80}
                />
                <label className={styles.editLabel}>内容</label>
                <textarea
                  className={styles.editTextarea}
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  rows={4}
                  maxLength={2000}
                />
                <label className={styles.editLabel}>开始日期</label>
                <input
                  className={styles.editInput}
                  type="date"
                  value={editDate}
                  onChange={e => setEditDate(e.target.value)}
                />
                <div className={styles.editActions}>
                  <button className={styles.saveBtn} onClick={() => saveEdit(item.id)}>保存</button>
                  <button className={styles.cancelBtn} onClick={() => setEditing(null)}>取消</button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function PreviewTab({ child, today }) {
  const days = Array.from({ length: 60 }, (_, i) => addDays(today, i))

  return (
    <div className={styles.previewList}>
      {days.map((dateStr, i) => {
        const items = getItemsForDate(child.items, dateStr)
        const isToday = dateStr === today
        return (
          <div key={dateStr} className={`${styles.previewRow} ${isToday ? styles.previewRowToday : ''}`}>
            <span className={styles.previewDate}>
              {isToday ? <strong>{displayDate(dateStr)} 今天</strong> : displayDate(dateStr)}
            </span>
            <div className={styles.previewChips}>
              {items.length === 0 ? (
                <span className={styles.previewEmpty}>—</span>
              ) : (
                items.map(item => (
                  <span key={item.id} className={styles.previewChip}>
                    #{item.number}
                  </span>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function AddTab({ child, today, onAddItem, onDone }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [dateOffset, setDateOffset] = useState(0)
  const [error, setError] = useState('')

  const DATE_LABELS = ['今天', '1天后', '2天后', '3天后', '4天后']

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) { setError('请填写标题'); return }
    if (!content.trim()) { setError('请填写内容'); return }
    const startDate = addDays(today, dateOffset)
    onAddItem({ title, content, startDate })
    setTitle('')
    setContent('')
    setDateOffset(0)
    setError('')
    onDone()
  }

  return (
    <form className={styles.addForm} onSubmit={handleSubmit}>
      <h2 className={styles.addFormTitle}>添加新内容</h2>

      <label className={styles.addLabel}>标题</label>
      <input
        className={styles.addInput}
        type="text"
        placeholder="例如：太阳系的行星"
        value={title}
        onChange={e => { setTitle(e.target.value); setError('') }}
        maxLength={80}
        autoFocus
      />

      <label className={styles.addLabel}>内容</label>
      <textarea
        className={styles.addTextarea}
        placeholder="例如：太阳系有八大行星：水星、金星、地球、火星、木星、土星、天王星、海王星。"
        value={content}
        onChange={e => { setContent(e.target.value); setError('') }}
        rows={5}
        maxLength={2000}
      />

      <label className={styles.addLabel}>开始日期</label>
      <div className={styles.dateBtns}>
        {DATE_LABELS.map((label, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.dateBtn} ${dateOffset === i ? styles.dateBtnActive : ''}`}
            style={dateOffset === i ? { background: child.color, color: '#fff', borderColor: child.color } : {}}
            onClick={() => setDateOffset(i)}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <p className={styles.addError}>{error}</p>}

      <button
        className={styles.addSubmitBtn}
        style={{ background: child.color }}
        type="submit"
      >
        保存
      </button>
    </form>
  )
}
