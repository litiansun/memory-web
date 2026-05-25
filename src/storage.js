const STORAGE_KEY = 'memory_web_data'

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

export function getChild(data, childId) {
  return data.children.find(c => c.id === childId) || null
}

export function addChild(data, name) {
  const child = {
    id: crypto.randomUUID(),
    name: name.trim(),
    color: AVATAR_COLORS[data.children.length % AVATAR_COLORS.length],
    cards: [],
    createdAt: Date.now(),
  }
  return { ...data, children: [...data.children, child] }
}

export function deleteChild(data, childId) {
  return { ...data, children: data.children.filter(c => c.id !== childId) }
}

export function addCard(data, childId, title, text) {
  const card = {
    id: crypto.randomUUID(),
    title: title.trim(),
    text: text.trim(),
    createdAt: Date.now(),
    reviewCount: 0,
    lastReviewed: null,
  }
  return {
    ...data,
    children: data.children.map(c =>
      c.id === childId ? { ...c, cards: [...c.cards, card] } : c
    ),
  }
}

export function deleteCard(data, childId, cardId) {
  return {
    ...data,
    children: data.children.map(c =>
      c.id === childId
        ? { ...c, cards: c.cards.filter(card => card.id !== cardId) }
        : c
    ),
  }
}

export function incrementReview(data, childId, cardId) {
  return {
    ...data,
    children: data.children.map(c =>
      c.id === childId
        ? {
            ...c,
            cards: c.cards.map(card =>
              card.id === cardId
                ? { ...card, reviewCount: card.reviewCount + 1, lastReviewed: Date.now() }
                : card
            ),
          }
        : c
    ),
  }
}

export const AVATAR_COLORS = [
  '#ff6b6b', '#4ecdc4', '#ffe66d', '#a855f7',
  '#f97316', '#22c55e', '#3b82f6', '#ec4899',
]
