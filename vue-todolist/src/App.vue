<template>
  <div id="app" class="app">
    <header>
      <h1>Todo Vue 3</h1>
    </header>

    <main>
      <todo-form />
      <todo-list />
    </main>
  </div>
</template>

<script setup>
import TodoForm from './components/TodoForm.vue'
import TodoList from './components/TodoList.vue' 
</script>

<style scoped>
.app {
  max-width: 720px;
  margin: 40px auto;
  padding: 16px;
  font-family: Inter, Arial, sans-serif;
}
header h1 {
  margin: 0 0 16px 0;
  text-align:center;
}
</style>
