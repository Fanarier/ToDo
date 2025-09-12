<template>
  <div class="todo-list">
    <div v-if="todos.items.length === 0" class="empty">Список пуст.</div>

    <ul v-else>
      <li v-for="task in todos.items" :key="task.id">
        <todo-item :task="task" />
      </li>
    </ul>

    <div class="controls" v-if="todos.items.length">
      <span>{{ remaining }} осталось</span>
      <button @click="clearCompleted" :disabled="!todos.completedCount">Удалить завершённые</button>
      <button @click="clearAll">Удалить всё</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTodos } from '../stores/useTodos'
import TodoItem from './TodoItem.vue'

const todos = useTodos()

const remaining = computed(() => todos.items.filter(t => !t.done).length)

function clearCompleted() {
  todos.removeCompleted()
}
function clearAll() {
  if (confirm('Удалить все задачи?')) todos.clearAll()
}
</script>

<style scoped>
.todo-list ul { list-style:none; padding:0; margin:0;}
.todo-list li + li { margin-top:8px; }
.controls {
  margin-top: 12px;
  display:flex;
  gap:8px;
  align-items:center;
}
.empty {
  color:#666;
  padding:12px;
  background:#f8f8f8;
  border-radius:6px;
}
</style>
