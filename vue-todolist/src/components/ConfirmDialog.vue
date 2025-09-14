<template>
  <v-dialog v-model="model" max-width="500">
    <v-card>
      <v-card-title class="text-h6">{{ title }}</v-card-title>
      <v-card-text>
        <div v-html="message"></div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="onCancel">Нет</v-btn>
        <v-btn color="primary" @click="onConfirm">Да</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { watch, ref } from 'vue'
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: 'Подтвердите' },
  message: { type: String, default: '' },
})
const emits = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const model = ref(props.modelValue)
watch(() => props.modelValue, v => model.value = v)
watch(model, v => emits('update:modelValue', v))

function onConfirm() {
  emits('confirm')
  model.value = false
}
function onCancel() {
  emits('cancel')
  model.value = false
}
</script>
