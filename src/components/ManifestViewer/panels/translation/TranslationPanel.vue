<template>
  <ViewerPanel v-bind="props" scrollable>
    <div v-for="translation in translations" class="leading-loose">
      {{ translation }}
    </div>
  </ViewerPanel>
</template>

<script setup lang="ts">
import ViewerPanel, {
  type ViewerPanelProps
} from '@/components/ManifestViewer/panels/ViewerPanel.vue'
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
  if (!viewerState.hasAnnotations) {
    return []
  }
  const ret: Array<string> = []
  viewerState.annotations
    .filter((a: any) => {
      const body = ensureArray(a.body) as AnnotationBody[]
      return (
        Array.isArray(a.motivation) &&
        a.motivation.includes('describing') &&
        body.some(
          (b: AnnotationBody) =>
            b.purpose === 'translating' && b.format === 'text/plain' && b.type === 'TextualBody'
        )
      )
    })
    .forEach((a: any) => {
      const body = (ensureArray(a.body) as AnnotationBody[]).find(
        (b) => b.purpose === 'translating' && b.format === 'text/plain' && b.type === 'TextualBody'
      )
      if (body && 'value' in body) {
        ret.push(body.value as string)
      }
    })
  return ret
})

const hasTranslations = computed((): boolean => {
  return translations.value.length > 0
})
</script>