<template>
  <Button variant="text" :icon="icon" :class="{ active: active }" class="sidebar__button" @click="$emit('toggle', !active)"><slot></slot></Button>
</template>
<script setup lang="ts">
import Button from 'primevue/button'

const props = defineProps({
  icon: String,
  active: Boolean,
})
</script>

<style>
@reference "tailwindcss";

.sidebar__button {
  @apply w-auto p-1.5;

  .p-button-icon {
    opacity: 0.6;
  }

  &.active {
    @apply bg-gray-300;

    .p-button-icon {
      opacity: 0.8;
    }
  }
}
</style>