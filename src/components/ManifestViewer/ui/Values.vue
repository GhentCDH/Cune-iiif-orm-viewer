<template>
  <template v-for="(value, index) in values" :key="index">
    <template v-if="detectHtml(value)">
      <span v-html="sanitizeHtml(value)"></span>
    </template>
    <span v-else>{{ value }}</span>
  </template>
</template>

<script setup lang="ts">
import { detectHtml, sanitizeHtml } from '@/lib/HtmlUtility'

interface Props {
  values: string[]
}

defineProps<Props>()
</script>