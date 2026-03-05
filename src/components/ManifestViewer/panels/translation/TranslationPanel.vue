<template>
  <ViewerPanel v-bind="props" scrollable>
    <div v-for="translation in translations" class="leading-loose">
      {{ translation }}
    </div>
  </ViewerPanel>
</template>

<script setup lang="ts">
import ViewerPanel, { type ViewerPanelProps } from '@/components/ManifestViewer/ui/ViewerPanel.vue'
import { useViewerState } from '@/stores/viewerState'
import { computed } from 'vue'
import { ensureArray } from '@/lib/ArrayHelper'

type AnnotationBody = {
  type: string
  value: string | object | Array<string | object>
  format?: string
  purpose?: string
}

const props = defineProps<ViewerPanelProps>()

const viewerState = useViewerState(props.viewerStateId)

const translations = computed((): Array<string> => {
  if (!viewerState.hasAnnotations) return []

  return viewerState.annotations.reduce((acc: string[], a: any) => {
    if (!Array.isArray(a.motivation) || !a.motivation.includes('describing')) return acc

    const body = (ensureArray(a.body) as AnnotationBody[]).find(
      (b) => b.purpose === 'translating' && b.format === 'text/plain' && b.type === 'TextualBody'
    )
    if (body && 'value' in body) acc.push(body.value as string)
    return acc
  }, [] as string[])
})

const hasTranslations = computed((): boolean => {
  return translations.value.length > 0
})
</script>