<template>
  <div>
    <v-row align="center" class="mb-4" dense>
      <v-col cols="9">
        <v-text-field
          v-model="text"
          label="Новая задача..."
          @keyup.enter="onSubmit"
          clearable
        />
      </v-col>

      <v-col cols="3">
        <v-btn :disabled="!text.trim()" color="primary" block @click="onSubmit">
          Добавить
        </v-btn>
      </v-col>
    </v-row>

    <ConfirmDialog
      v-model="confirmVisible"
      title="Добавить задачу?"
      :message="`Добавить задачу: <strong>${escapeHtml(text)}</strong>?`"
      @confirm="doAdd"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTodos } from '../stores/useTodos'
import ConfirmDialog from './ConfirmDialog.vue'

const todos = useTodos()
const text = ref('')
const confirmVisible = ref(false)
const emits = defineEmits(['notify'])

function onSubmit() {
  if (!text.value.trim()) return
  confirmVisible.value = true
}

// добавление после подтверждения
function doAdd() {
  todos.addTodo(text.value.trim())
  emits('notify', 'Задача добавлена') // сообщение в App.vue
  text.value = ''
}

// маленькая защита от XSS в диалоге
function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
</script>
