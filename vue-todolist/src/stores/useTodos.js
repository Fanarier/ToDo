import { defineStore } from 'pinia'
import { reactive, watch } from 'vue'

const STORAGE_KEY = 'vue_todo_list_v1'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export const useTodos = defineStore('todos', () => {
  const items = reactive(loadFromStorage())

  function persist() {
    // сохранение неизменяемой копии
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }

  function makeId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2,8)
  }

  function addTodo(text) {
    items.push({ id: makeId(), text, done: false, createdAt: Date.now() })
    persist()
  }

  function removeTodo(id) {
    const idx = items.findIndex(i => i.id === id)
    if (idx !== -1) items.splice(idx, 1)
    persist()
  }

  function toggleDone(id) {
    const t = items.find(i => i.id === id)
    if (t) t.done = !t.done
    persist()
  }

  function updateTodo(id, text) {
    const t = items.find(i => i.id === id)
    if (t) t.text = text
    persist()
  }

  function removeCompleted() {
    for (let i = items.length - 1; i >= 0; i--) {
      if (items[i].done) items.splice(i, 1)
    }
    persist()
  }

  function clearAll() {
    items.splice(0, items.length)
    persist()
  }

  const completedCount = () => items.filter(i => i.done).length

  // На всякий случай: следим за изменениями и сохраняем (защитный)
  watch(items, persist, { deep: true })

  return {
    items,
    addTodo,
    removeTodo,
    toggleDone,
    updateTodo,
    removeCompleted,
    clearAll,
    completedCount
  }
})
