<template>
  <div class="todo-item">
    <input type="checkbox" v-model="localDone" @change="toggle" />
    <span :class="{done: localDone}">{{ task.text }}</span>
    <div class="actions">
      <button @click="edit">✏️</button>
      <button @click="remove">🗑️</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useTodos } from '../stores/useTodos'
const props = defineProps({ task: Object })

const todos = useTodos()
const localDone = ref(props.task.done)

watch(() => props.task.done, v => localDone.value = v)

function toggle() {
  todos.toggleDone(props.task.id)
}

function remove() {
  if (confirm('Удалить задачу?')) todos.removeTodo(props.task.id)
}

function edit() {
  const newText = prompt('Редактировать задачу', props.task.text)
  if (newText !== null) {
    const trimmed = newText.trim()
    if (trimmed) todos.updateTodo(props.task.id, trimmed)
  }
}
</script>

<style scoped>
.todo-item {
  display:flex;
  align-items:center;
  gap:8px;
  padding:8px;
  border:1px solid #eee;
  border-radius:6px;
  background:#fff;
}
.todo-item span { flex:1; }
.todo-item span.done { text-decoration:line-through; color:#888; }
.actions button {
  border:none;
  background:transparent;
  cursor:pointer;
  padding:4px;
}
</style>
