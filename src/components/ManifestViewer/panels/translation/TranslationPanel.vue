<template>
  <ViewerPanel v-bind="props" scrollable>
    <div v-for="translation in translations" class="leading-loose">
      {{ translation }}
    </div>
  </ViewerPanel>
</template>

<script setup lang="ts">
import ViewerPanel, { type ViewerPanelProps } from '@/components/ManifestViewer/panels/ViewerPanel.vue'
import { useViewerState } from '@/stores/viewerState'
import { computed } from 'vue'
import { ensureArray } from '@/lib/ArrayHelper'

const props = defineProps<ViewerPanelProps>()

const viewerState = useViewerState(props.viewerStateId)

const translations = computed((): Array<string> => {
  if (!viewerState.hasAnnotations) {
    return []
  }
  const ret = []
  viewerState.annotations.filter(a => {
    const body = Array.isArray(a.body) ? a.body : [a.body]
    return Array.isArray(a.motivation) && a.motivation.includes("describing")
      && body.some(b => b.purpose === 'translating' && b.format==='text/plain' && b.type==='TextualBody')
  }).forEach(a => {
    const body = ensureArray(a.body).find(
      b => b.purpose === 'translating' && b.format==='text/plain' && b.type==='TextualBody'
    )
    if (body && 'value' in body) {
      ret.push(body.value)
    }
  })
  return ret
})

const hasTranslations = computed((): boolean => {
  return translations.value.length > 0
})
</script>