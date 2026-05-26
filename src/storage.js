const STORAGE_KEY = 'memory_web_v2'
export const REVIEW_OFFSETS = [0, 1, 2, 4, 7, 15, 30]

export const AVATAR_COLORS = [
  '#ff6b6b', '#4ecdc4', '#ffe66d', '#a855f7',
  '#f97316', '#22c55e', '#3b82f6', '#ec4899',
]

export function todayStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function addDays(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d + days)
  const yr = date.getFullYear()
  const mo = String(date.getMonth() + 1).padStart(2, '0')
  const dy = String(date.getDate()).padStart(2, '0')
  return `${yr}-${mo}-${dy}`
}

export function getReviewDates(startDate) {
  return REVIEW_OFFSETS.map(offset => addDays(startDate, offset))
}

export function getItemsForDate(items, dateStr) {
  return items.filter(item => getReviewDates(item.startDate).includes(dateStr))
}

export function displayDate(dateStr) {
  const [, m, d] = dateStr.split('-').map(Number)
  return `${m}月${d}日`
}

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { children: [] }
  } catch {
    return { children: [] }
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function addChild(data, name) {
  const child = {
    id: crypto.randomUUID(),
    name: name.trim(),
    color: AVATAR_COLORS[data.children.length % AVATAR_COLORS.length],
    items: [],
    nextNumber: 1,
    createdAt: Date.now(),
  }
  return { ...data, children: [...data.children, child] }
}

export function deleteChild(data, childId) {
  return { ...data, children: data.children.filter(c => c.id !== childId) }
}

export function addItem(data, childId, { title, content, startDate }) {
  return {
    ...data,
    children: data.children.map(c => {
      if (c.id !== childId) return c
      const item = {
        id: crypto.randomUUID(),
        number: c.nextNumber,
        title: title.trim(),
        content: content.trim(),
        startDate,
        createdAt: Date.now(),
      }
      return { ...c, items: [...c.items, item], nextNumber: c.nextNumber + 1 }
    }),
  }
}

export function updateItem(data, childId, itemId, { title, content, startDate }) {
  return {
    ...data,
    children: data.children.map(c => {
      if (c.id !== childId) return c
      return {
        ...c,
        items: c.items.map(it =>
          it.id === itemId ? { ...it, title: title.trim(), content: content.trim(), startDate } : it
        ),
      }
    }),
  }
}

export function deleteItem(data, childId, itemId) {
  return {
    ...data,
    children: data.children.map(c =>
      c.id === childId ? { ...c, items: c.items.filter(it => it.id !== itemId) } : c
    ),
  }
}
