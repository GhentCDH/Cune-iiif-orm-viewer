<template>
  <div class="metadata">
    <div class="mb-2" v-for="(entry, entryKey) in localizedMetadata" :key="entryKey">
      <div class="metadata__label">
        <Label>
          <span v-for="(label, labelIndex) in entry.label" :key="labelIndex">{{ label }}</span>
        </Label>
      </div>
      <div class="metadata__value">
        <Values :values="entry.value"></Values>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs, computed } from 'vue'
import Label from '@/components/ManifestViewer/ui/Label.vue'
import Values from '@/components/ManifestViewer/ui/Values.vue'

import { useManifestHelper } from '@/lib/useManifestHelper.ts'
import { useVault } from '@/lib/useVault.ts'

interface Props {
  metadata: object
  language?: string
}

const props = withDefaults(defineProps<Props>(), {
  language: 'en'
})

const { metadata, language } = toRefs(props)

// init helpers
const vault = useVault()
const { getLocalizedMetadata } = useManifestHelper(vault)

// computed for localized metadata values
const localizedMetadata = computed(() => {
  return getLocalizedMetadata(metadata.value, language.value)
})
</script>
