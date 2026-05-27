import { useState, useRef } from 'react'
import styles from './ChildPage.module.css'
import { todayStr, addDays, getReviewDates, getItemsForDate, displayDate } from '../storage.js'

const REVIEW_LABELS = ['初次学习', '第1次复习', '第2次复习', '第3次复习', '第4次复习', '第5次复习', '第6次复习']

// ── Export helpers ──────────────────────────────────────────────────────────

function exportToXlsx(child) {
  import('xlsx').then((XLSX) => {
    const today = todayStr()
    const rows = child.items.map(item => {
      const reviewDates = getReviewDates(item.startDate)
      const past = reviewDates.filter(d => d <= today)
      const future = reviewDates.filter(d => d > today)
      return {
        '编号': item.number,
        '标题': item.title,
        '内容': item.content,
        '登录日期': item.startDate,
        '已记忆日期': past.join(', '),
        '计划记忆日期': future.join(', '),
      }
    })
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Memory')
    XLSX.writeFile(wb, `${child.name}-memory.xlsx`)
  }).catch(() => {})
}

// ── Column name matching ────────────────────────────────────────────────────

function findCol(headers, candidates) {
  for (const c of candidates) {
    const found = headers.find(h => h === c)
    if (found !== undefined) return found
  }
  return null
}

// ── ChildPage ───────────────────────────────────────────────────────────────

export default function ChildPage({ child, onBack, onStudy, onAddItem, onUpdateItem, onDeleteItem, onBulkAddItems }) {
  const [tab, setTab] = useState('today')
  const today = todayStr()

  const tabs = [
    { key: 'today', label: '今天' },
    { key: 'all', label: '全部内容' },
    { key: 'preview', label: '60天预览' },
    { key: 'add', label: '＋新内容' },
  ]

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <button className={styles.backBtn} onClick={onBack}>← 返回</button>
          <div className={styles.childInfo}>
            <div className={styles.avatar} style={{ background: child.color }}>
              {child.name.charAt(0).toUpperCase()}
            </div>
            <span className={styles.childName}>{child.name}</span>
          </div>
          <div className={styles.headerActions}>
            <button
              className={styles.exportBtn}
              onClick={() => exportToXlsx(child)}
              title="导出数据"
            >
              ↓ 导出
            </button>
            <button
              className={styles.studyBtn}
              onClick={onStudy}
            >
              ▶ 开始记忆
            </button>
          </div>
        </div>
        <nav className={styles.tabBar}>
          {tabs.map(t => (
            <button
              key={t.key}
              className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`}
              style={tab === t.key ? { color: child.color, borderBottomColor: child.color } : {}}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className={styles.main}>
        {tab === 'today' && <TodayTab child={child} today={today} color={child.color} />}
        {tab === 'all' && (
          <AllTab
            child={child}
            today={today}
            color={child.color}
            onUpdateItem={onUpdateItem}
            onDeleteItem={onDeleteItem}
          />
        )}
        {tab === 'preview' && <PreviewTab child={child} today={today} color={child.color} />}
        {tab === 'add' && (
          <AddTab
            child={child}
            today={today}
            color={child.color}
            onAddItem={onAddItem}
            onBulkAddItems={onBulkAddItems}
            onDone={() => setTab('today')}
          />
        )}
      </main>
    </div>
  )
}

function TodayTab({ child, today, color }) {
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
          <div key={item.id} className={styles.todayCard} style={{ borderLeftColor: color }}>
            <div className={styles.todayCardHeader}>
              <span className={styles.itemNumber} style={{ color }}>#{item.number}</span>
              <span className={styles.reviewLabel} style={{ background: color + '22', color }}>
                {label}
              </span>
            </div>
            <h3 className={styles.todayTitle}>{item.title}</h3>
            <p className={styles.todayContent}>{item.content}</p>
          </div>
        )
      })}
    </div>
  )
}

function AllTab({ child, today, color, onUpdateItem, onDeleteItem }) {
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
        <p className={styles.emptySubtext}>切换到「＋新内容」添加第一条！</p>
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
          <div
            key={item.id}
            className={`${styles.allItem} ${isExpanded ? styles.allItemExpanded : ''}`}
          >
            <button
              className={styles.allItemRow}
              onClick={() => {
                if (isEditing) return
                setExpanded(isExpanded ? null : item.id)
                if (isDeleting) setDeleting(null)
              }}
            >
              <span className={styles.allItemNumber} style={{ color }}>#{item.number}</span>
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
                          {isToday && (
                            <span className={styles.reviewDateToday} style={{ background: color }}>
                              今天
                            </span>
                          )}
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
                      onClick={() => {
                        onDeleteItem(item.id)
                        setDeleting(null)
                        setExpanded(null)
                      }}
                    >
                      删除
                    </button>
                    <button className={styles.confirmNo} onClick={() => setDeleting(null)}>
                      取消
                    </button>
                  </div>
                ) : (
                  <div className={styles.itemActions}>
                    <button className={styles.editBtn} onClick={() => startEdit(item)}>
                      编辑
                    </button>
                    <button className={styles.deleteItemBtn} onClick={() => setDeleting(item.id)}>
                      删除
                    </button>
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
                  <button
                    className={styles.saveBtn}
                    style={{ background: color }}
                    onClick={() => saveEdit(item.id)}
                  >
                    保存
                  </button>
                  <button className={styles.cancelBtn} onClick={() => setEditing(null)}>
                    取消
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function PreviewTab({ child, today, color }) {
  const days = Array.from({ length: 60 }, (_, i) => addDays(today, i))

  return (
    <div className={styles.previewList}>
      {days.map(dateStr => {
        const items = getItemsForDate(child.items, dateStr)
        const isToday = dateStr === today
        return (
          <div
            key={dateStr}
            className={`${styles.previewRow} ${isToday ? styles.previewRowToday : ''}`}
            style={isToday ? { borderLeftColor: color, background: color + '12' } : {}}
          >
            <span className={styles.previewDate}>
              {isToday ? (
                <strong style={{ color }}>{displayDate(dateStr)} 今天</strong>
              ) : (
                displayDate(dateStr)
              )}
            </span>
            <div className={styles.previewChips}>
              {items.length === 0 ? (
                <span className={styles.previewEmpty}>—</span>
              ) : (
                items.map(item => (
                  <span
                    key={item.id}
                    className={styles.previewChip}
                    style={{ background: color + '22', color }}
                  >
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

function AddTab({ child, today, color, onAddItem, onBulkAddItems, onDone }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [dateOffset, setDateOffset] = useState(0)
  const [error, setError] = useState('')

  // Import state
  const [importPreview, setImportPreview] = useState(null) // [{title, content, startDate}]
  const [importError, setImportError] = useState('')
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef(null)

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

  async function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setImportError('')
    setImportPreview(null)
    setImporting(true)

    try {
      const XLSX = await import('xlsx')
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(ws, { defval: '' })

      if (rows.length === 0) {
        setImportError('文件中没有数据')
        setImporting(false)
        return
      }

      const headers = Object.keys(rows[0])

      const titleCol = findCol(headers, ['标题', 'title', 'Title'])
      const contentCol = findCol(headers, ['内容', 'content', 'Content'])
      const dateCol = findCol(headers, ['开始日期', 'startDate', 'StartDate'])

      if (!titleCol) { setImportError('未找到标题列（标题/title/Title）'); setImporting(false); return }
      if (!contentCol) { setImportError('未找到内容列（内容/content/Content）'); setImporting(false); return }

      const parsed = rows.map((row, idx) => {
        const t = String(row[titleCol] || '').trim()
        const c = String(row[contentCol] || '').trim()
        let startDate
        if (dateCol && row[dateCol]) {
          // Try to parse date value (may be serial number or string)
          const raw = row[dateCol]
          if (typeof raw === 'number') {
            // Excel serial date
            const d = XLSX.SSF.parse_date_code(raw)
            startDate = `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`
          } else {
            // String date — normalise
            const s = String(raw).trim()
            if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
              startDate = s
            } else {
              const d2 = new Date(s)
              if (!isNaN(d2)) {
                const yr = d2.getFullYear()
                const mo = String(d2.getMonth() + 1).padStart(2, '0')
                const dy = String(d2.getDate()).padStart(2, '0')
                startDate = `${yr}-${mo}-${dy}`
              }
            }
          }
        }
        if (!startDate) {
          // Auto-schedule: 5 per day, rows 1-5 → day 0, rows 6-10 → day 1, ...
          const dayOffset = Math.floor(idx / 5)
          startDate = addDays(today, dayOffset)
        }
        return { title: t, content: c, startDate }
      }).filter(r => r.title && r.content)

      if (parsed.length === 0) {
        setImportError('没有有效数据行')
        setImporting(false)
        return
      }

      setImportPreview(parsed)
    } catch (err) {
      setImportError('解析文件失败：' + (err.message || '未知错误'))
    }

    setImporting(false)
    // Reset file input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleBulkImport() {
    if (!importPreview || importPreview.length === 0) return
    onBulkAddItems(importPreview)
    setImportPreview(null)
    onDone()
  }

  return (
    <div>
      {/* Import section */}
      <div className={styles.importSection}>
        <h3 className={styles.importTitle}>导入文件</h3>
        <p className={styles.importHint}>支持 .xlsx 和 .csv 文件，需包含「标题」和「内容」列</p>
        <label className={styles.fileLabel}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.csv"
            className={styles.fileInput}
            onChange={handleFileChange}
            disabled={importing}
          />
          <span className={styles.fileLabelText}>
            {importing ? '解析中…' : '选择文件'}
          </span>
        </label>

        {importError && <p className={styles.importError}>{importError}</p>}

        {importPreview && (
          <div className={styles.previewBox}>
            <p className={styles.previewCount}>预览（共 {importPreview.length} 条）</p>
            <div className={styles.previewRows}>
              {importPreview.slice(0, 10).map((row, i) => (
                <div key={i} className={styles.previewItem}>
                  <span className={styles.previewItemTitle}>{row.title}</span>
                  <span className={styles.previewItemDate}>{row.startDate}</span>
                </div>
              ))}
              {importPreview.length > 10 && (
                <p className={styles.previewMore}>…还有 {importPreview.length - 10} 条</p>
              )}
            </div>
            <button
              className={styles.bulkImportBtn}
              style={{ background: color }}
              onClick={handleBulkImport}
            >
              批量导入 ({importPreview.length}条)
            </button>
          </div>
        )}
      </div>

      <div className={styles.orDivider}>
        <span>或手动添加</span>
      </div>

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
          placeholder="例如：太阳系有八大行星：水星、金星、地球…"
          value={content}
          onChange={e => { setContent(e.target.value); setError('') }}
          rows={5}
          maxLength={2000}
        />

        <label className={styles.addLabel}>开始日期</label>
        <div className={styles.dateBtns}>
          {DATE_LABELS.map((lbl, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.dateBtn} ${dateOffset === i ? styles.dateBtnActive : ''}`}
              style={dateOffset === i ? { background: color, color: '#fff', borderColor: color } : {}}
              onClick={() => setDateOffset(i)}
            >
              {lbl}
            </button>
          ))}
        </div>

        {error && <p className={styles.addError}>{error}</p>}

        <button
          className={styles.addSubmitBtn}
          style={{ background: color }}
          type="submit"
        >
          保存
        </button>
      </form>
    </div>
  )
}
