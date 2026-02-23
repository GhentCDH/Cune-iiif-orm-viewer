<template>
  <ToggleButton
    pt:label="hidden"
    pt:icon="relative"
    class="viewer-toggle-button"
    severity="success"
    size="small"
    :model-value="modelValue"
    :aria-label="ariaLabel"
    :title="title"
    :on-icon="icon"
    :off-icon="icon"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
import ToggleButton from 'primevue/togglebutton'

defineProps<{
  modelValue?: boolean
  ariaLabel?: string
  title?: string
  icon?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>
