<template>
  <v-app>
    <v-main>
      <v-container class="pa-6" max-width="900">
        <v-card elevation="6" class="pa-4">
          <v-row align="center" justify="space-between">
            <v-col cols="auto">
              <h2 class="mb-0">Тасклист (Vuetify)</h2>
            </v-col>

            <v-col cols="auto" class="d-flex gap-2">
              <v-btn variant="outlined" @click="clearAll" :disabled="tasks.length===0">Очистить</v-btn>
              <v-btn color="primary" @click="openAddDialog">Добавить</v-btn>
            </v-col>
          </v-row>

          <!-- Ввод задачи -->
          <v-row class="mt-4" align="center">
            <v-col>
              <v-text-field
                v-model="draft.title"
                label="Новая задача"
                @keyup.enter="promptAdd"
                :counter="150"
              />
            </v-col>
            <v-col cols="auto">
              <v-btn color="primary" @click="promptAdd">Добавить</v-btn>
            </v-col>
          </v-row>

          <!-- Список задач — draggable -->
          <v-row class="mt-4">
            <v-col>
              <draggable
                v-model="tasks"
                @end="onDragEnd"
                item-key="id"
                tag="div"
              >
                <template #item="{ element, index }">
                  <v-card class="mb-3" outlined>
                    <v-row align="center" class="px-3 py-2">
                      <v-col cols="auto" class="drag-handle" style="cursor:grab;">
                        <v-icon>mdi-drag</v-icon>
                      </v-col>

                      <v-col>
                        <div :class="{ 'text-decoration-line-through': element.done }">
                          <strong>{{ element.title }}</strong>
                        </div>
                        <div class="text-caption">#{{ element.id }} • {{ formattedDate(element.createdAt) }}</div>
                      </v-col>

                      <v-col cols="auto" class="d-flex gap-2">
                        <v-btn icon @click="toggleDone(element)"><v-icon>{{ element.done ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline' }}</v-icon></v-btn>

                        <!-- стрелочная сортировка (fallback) -->
                        <v-btn icon small @click="moveUp(index)" :disabled="index===0"><v-icon>mdi-arrow-up</v-icon></v-btn>
                        <v-btn icon small @click="moveDown(index)" :disabled="index===tasks.length-1"><v-icon>mdi-arrow-down</v-icon></v-btn>

                        <v-btn icon @click="openEditDialog(element)"><v-icon>mdi-pencil</v-icon></v-btn>
                        <v-btn icon color="error" @click="promptDelete(element)"><v-icon>mdi-delete</v-icon></v-btn>
                      </v-col>
                    </v-row>
                  </v-card>
                </template>
              </draggable>

              <div v-if="tasks.length===0" class="text-center text-caption mt-6">Список пуст</div>
            </v-col>
          </v-row>
        </v-card>
      </v-container>

      <!-- Диалог подтверждения (универсальный) -->
      <v-dialog v-model="confirm.visible" max-width="520">
        <v-card>
          <v-card-title class="text-h6">{{ confirm.title }}</v-card-title>
          <v-card-text>{{ confirm.message }}</v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn variant="outlined" @click="onConfirm(false)">Нет</v-btn>
            <v-btn color="primary" @click="onConfirm(true)">Да</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Диалог добавления/редактирования -->
      <v-dialog v-model="editDialog.visible" max-width="600">
        <v-card>
          <v-card-title>{{ editDialog.isEdit ? 'Редактировать задачу' : 'Добавить задачу' }}</v-card-title>
          <v-card-text>
            <v-text-field v-model="editDialog.model.title" label="Заголовок" />
            <v-textarea v-model="editDialog.model.note" label="Описание (опционально)" rows="3" />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn variant="outlined" @click="closeEdit">Отмена</v-btn>
            <v-btn color="primary" @click="confirmEdit">Сохранить</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Snackbar -->
      <v-snackbar v-model="snackbar.show" :timeout="2500">
        {{ snackbar.text }}
        <template #action>
          <v-btn text @click="snackbar.show=false">OK</v-btn>
        </template>
      </v-snackbar>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import draggable from 'vuedraggable' // sortable wrapper

// storage key
const STORAGE_KEY = 'vuetodo.tasks'

// tasks
const tasks = ref([])

// загрузка
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    tasks.value = raw ? JSON.parse(raw) : []
  } catch {
    tasks.value = []
  }
}
load()

// сохранение
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks.value))
}

// черновик
const draft = reactive({ title: '' })

// диалог подтверждения
const confirm = reactive({
  visible: false,
  title: '',
  message: '',
  payload: null,
  cb: null,
})

// открывает confirm
function showConfirm(title, message, payload = null) {
  confirm.title = title
  confirm.message = message
  confirm.payload = payload
  confirm.visible = true
}

// обработчик confirm
function onConfirm(result) {
  confirm.visible = false
  if (typeof confirm.cb === 'function') confirm.cb(result, confirm.payload)
  confirm.cb = null
  confirm.payload = null
}

// глобальный snackbar
const snackbar = reactive({ show: false, text: '' })
function showMsg(t) { snackbar.text = t; snackbar.show = true }

// диалог редактирования
const editDialog = reactive({
  visible: false,
  isEdit: false,
  model: { id: null, title: '', note: '', done: false, createdAt: null }
})

// форматы
function formattedDate(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleString()
}

/* promptAdd */ // подтверждение добавить
function promptAdd() {
  if (!draft.title || !draft.title.trim()) {
    showMsg('Заголовок пуст')
    return
  }
  showConfirm('Добавить задачу', `Добавить: «${draft.title}»?`, { title: draft.title, note: '' })
  confirm.cb = (ok, payload) => {
    if (!ok) return
    const item = {
      id: uuidv4(),
      title: payload.title,
      note: payload.note || '',
      done: false,
      createdAt: Date.now()
    }
    tasks.value.unshift(item)
    draft.title = ''
    save()
    showMsg('Добавлено')
  }
}

/* openAddDialog */ // открыть add
function openAddDialog() {
  editDialog.isEdit = false
  editDialog.model = { id: null, title: '', note: '', done: false, createdAt: null }
  editDialog.visible = true
}

/* openEditDialog */ // открыть edit
function openEditDialog(item) {
  editDialog.isEdit = true
  editDialog.model = { ...item }
  editDialog.visible = true
}

/* closeEdit */ // закрыть edit
function closeEdit() { editDialog.visible = false }

/* confirmEdit */ // подтвердить edit/add
function confirmEdit() {
  if (!editDialog.model.title || !editDialog.model.title.trim()) {
    showMsg('Требуется заголовок')
    return
  }
  const isEdit = editDialog.isEdit
  showConfirm(isEdit ? 'Сохранить изменения' : 'Подтвердить добавление', isEdit ? 'Сохранить изменения в задаче?' : `Добавить: «${editDialog.model.title}»?`, { model: { ...editDialog.model }, isEdit })
  confirm.cb = (ok, payload) => {
    if (!ok) return
    if (payload.isEdit) {
      const idx = tasks.value.findIndex(t => t.id === payload.model.id)
      if (idx !== -1) {
        tasks.value[idx] = { ...tasks.value[idx], ...payload.model }
      }
      showMsg('Сохранено')
    } else {
      const item = { ...payload.model, id: uuidv4(), createdAt: Date.now(), done: false }
      tasks.value.unshift(item)
      showMsg('Добавлено')
    }
    editDialog.visible = false
    save()
  }
}

/* promptDelete */ // подтверждение удаления
function promptDelete(item) {
  showConfirm('Удалить задачу', `Удалить: «${item.title}»?`, item)
  confirm.cb = (ok, payload) => {
    if (!ok) return
    const idx = tasks.value.findIndex(t => t.id === payload.id)
    if (idx !== -1) {
      tasks.value.splice(idx, 1)
      save()
      showMsg('Удалено')
    }
  }
}

/* clearAll */ // очистить
function clearAll() {
  showConfirm('Очистить все', 'Вы уверены, что хотите удалить все задачи?')
  confirm.cb = (ok) => {
    if (!ok) return
    tasks.value = []
    save()
    showMsg('Список очищен')
  }
}

/* toggleDone */ // переключить done
function toggleDone(item) {
  const idx = tasks.value.findIndex(t => t.id === item.id)
  if (idx !== -1) {
    tasks.value[idx].done = !tasks.value[idx].done
    save()
  }
}

/* reorder helpers */
function moveUp(i) {
  if (i <= 0) return
  const tmp = tasks.value[i-1]
  tasks.value[i-1] = tasks.value[i]
  tasks.value[i] = tmp
  save()
}
function moveDown(i) {
  if (i >= tasks.value.length-1) return
  const tmp = tasks.value[i+1]
  tasks.value[i+1] = tasks.value[i]
  tasks.value[i] = tmp
  save()
}

// drag end
function onDragEnd() {
  save()
}
</script>

<style scoped>
.drag-handle { width: 36px; display:flex; align-items:center; justify-content:center; }
/* два слова */ 
.text-decoration-line-through { text-decoration: line-through; }
</style>
