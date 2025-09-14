<template>
  <v-app>
    <v-main>
      <v-container class="pa-4" max-width="720">
        <v-row>
          <v-col cols="12">
            <h1 class="text-center">Todo — Vue 3 + Pinia + Vuetify</h1>
          </v-col>

          <v-col cols="12">
            <todo-form @notify="showMessage" />
          </v-col>

          <v-col cols="12">
            <todo-list @notify="showMessage" />
          </v-col>
        </v-row>
      </v-container>

      <v-snackbar v-model="snackbar.show" :timeout="3000">
        {{ snackbar.text }}
      </v-snackbar>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import TodoForm from './components/TodoForm.vue'
import TodoList from './components/TodoList.vue'

const snackbar = ref({ show: false, text: '' })

function showMessage(text) {
  snackbar.value.text = text
  snackbar.value.show = true
}
</script>