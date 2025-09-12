<template>
  <form class="todo-form" @submit.prevent="add">
    <input v-model="text" placeholder="Новая задача..." />
    <button type="submit" :disabled="!text.trim()">Добавить</button>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { useTodos } from '../stores/useTodos'

const text = ref('')
const todos = useTodos()

function add() {
  const value = text.value.trim()
  if (!value) return
  todos.addTodo(value)
  text.value = ''
}
</script>

<style scoped>
.todo-form {
  display:flex;
  gap:8px;
  margin-bottom:16px;
}
.todo-form input {
  flex:1;
  padding:8px;
  border:1px solid #ccc;
  border-radius:6px;
}
.todo-form button {
  padding: 8px 14px;
  border-radius:6px;
  border: none;
  cursor: pointer;
}
.todo-form button:disabled {
  opacity:0.5;
  cursor:not-allowed;
}
</style>
