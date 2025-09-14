<template>
  <div>
    <div v-if="todos.items.length === 0">
      <v-alert type="info">Список пуст.</v-alert>
    </div>

    <draggable v-model="todos.items" item-key="id" @end="onDragEnd" :animation="200">
      <template #item="{ element, index }">
        <v-card class="mb-2" elevation="1">
          <v-list-item>
            <v-list-item-action>
              <v-checkbox v-model="element.done" @change="toggleDone(element.id)" />
            </v-list-item-action>

            <v-list-item-content>
              <v-list-item-title :class="{ 'text--line-through': element.done }">
                {{ element.text }}
              </v-list-item-title>
            </v-list-item-content>

            <v-list-item-action>
              <!-- стрелочки для перестановки (fallback) -->
              <v-btn icon small @click="moveUp(index)" :disabled="index === 0" title="Вверх">
                <v-icon>mdi-arrow-up</v-icon>
              </v-btn>
              <v-btn icon small @click="moveDown(index)" :disabled="index === todos.items.length - 1" title="Вниз">
                <v-icon>mdi-arrow-down</v-icon>
              </v-btn>

              <v-btn icon small @click="onEdit(element)" title="Редактировать">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>

              <v-btn icon small color="red" @click="onRemove(element)" title="Удалить">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-card>
      </template>
    </draggable>

    <v-row class="mt-3" align="center">
      <v-col>
        <span>{{ remaining }} осталось</span>
      </v-col>
      <v-col class="d-flex justify-end">
        <v-btn text @click="clearCompleted" :disabled="!todos.completedCount()">Удалить завершённые</v-btn>
        <v-btn text color="error" @click="clearAllConfirm" :disabled="!todos.items.length">Удалить всё</v-btn>
      </v-col>
    </v-row>

    <!-- Диалоги -->
    <ConfirmDialog
      v-model="removeConfirmVisible"
      title="Удалить задачу?"
      :message="removeMessage"
      @confirm="doRemove"
    />

    <v-dialog v-model="editDialogVisible" max-width="600">
      <v-card>
        <v-card-title>Редактировать задачу</v-card-title>
        <v-card-text>
          <v-text-field v-model="editText" label="Текст задачи" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="editDialogVisible = false">Отмена</v-btn>
          <v-btn color="primary" @click="doUpdate">Сохранить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <ConfirmDialog
      v-model="clearAllVisible"
      title="Удалить всё?"
      message="Вы уверены, что хотите удалить все задачи?"
      @confirm="doClearAll"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useTodos } from '../stores/useTodos'
import ConfirmDialog from './ConfirmDialog.vue'
import draggable from 'vuedraggable'
const todos = useTodos()
const emits = defineEmits(['notify'])

const removeConfirmVisible = ref(false)
const removeTargetId = ref(null)
const removeMessage = ref('')

const editDialogVisible = ref(false)
const editTargetId = ref(null)
const editText = ref('')

const clearAllVisible = ref(false)

const remaining = computed(() => todos.items.filter(t => !t.done).length)

// DnD end
function onDragEnd(evt) {
  // vuedraggable уже изменил массив, но на всякий можно убедиться
  // evt.oldIndex, evt.newIndex доступны
  if (evt && typeof evt.oldIndex === 'number' && typeof evt.newIndex === 'number') {
    // я специально вызываю reorder, но массив уже на месте — reorder сохранит состояние
    todos.reorder(evt.oldIndex, evt.newIndex)
    emits('notify', 'Порядок задач изменён')
  }
}

// fallback: стрелочки
function moveUp(index) {
  if (index <= 0) return
  todos.reorder(index, index - 1)
  emits('notify', 'Задача перемещена вверх')
}
function moveDown(index) {
  if (index >= todos.items.length - 1) return
  todos.reorder(index, index + 1)
  emits('notify', 'Задача перемещена вниз')
}

// Удаление (подтверждение)
function onRemove(item) {
  removeTargetId.value = item.id
  removeMessage.value = `Удалить задачу: <strong>${escapeHtml(item.text)}</strong>?`
  removeConfirmVisible.value = true
}
function doRemove() {
  todos.removeTodo(removeTargetId.value)
  emits('notify', 'Задача удалена')
  removeTargetId.value = null
}

// Редактирование
function onEdit(item) {
  editTargetId.value = item.id
  editText.value = item.text
  editDialogVisible.value = true
}
function doUpdate() {
  const trimmed = (editText.value || '').trim()
  if (!trimmed) {
    // уведомление
    emits('notify', 'Текст не может быть пустым')
    return
  }
  todos.updateTodo(editTargetId.value, trimmed)
  editDialogVisible.value = false
  emits('notify', 'Задача обновлена')
  editTargetId.value = null
}

// Добавление/удаление всех
function clearCompleted() {
  todos.removeCompleted()
  emits('notify', 'Завершённые задачи удалены')
}
function clearAllConfirm() {
  clearAllVisible.value = true
}
function doClearAll() {
  todos.clearAll()
  emits('notify', 'Все задачи удалены')
}

// переключение done
function toggleDone(id) {
  todos.toggleDone(id)
  emits('notify', 'Статус задачи обновлён')
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
</script>

<style scoped>
.text--line-through {
  text-decoration: line-through;
  color: rgba(0,0,0,0.45);
}
</style>
