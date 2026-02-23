<template>
  <Button
    severity="secondary"
    size="small"
    :icon="icon"
    :aria-label="ariaLabel"
    :title="title"
    @click="emit('click', $event)"
  />
</template>

<script setup lang="ts">
import Button from 'primevue/button'

defineProps<{
  icon: string
  ariaLabel?: string
  title?: string
}>()

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()
</script>
