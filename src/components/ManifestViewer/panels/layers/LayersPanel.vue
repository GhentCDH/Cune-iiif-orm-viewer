<template>
  <ViewerPanel v-bind="props" scrollable>
    <template #options>
      <div class="flex gap-1 right">
        <Button
          v-for="preset in layerPresets"
          :key="preset.id"
          :label="preset.label"
          size="small"
          severity="secondary"
          @click="viewerState.setLayerPreset(preset)"
        ></Button>
      </div>
    </template>
    <Layers v-model="viewerState.layers" />
  </ViewerPanel>
</template>

<script setup lang="ts">
import { watch, onMounted, computed } from 'vue'
import Button from 'primevue/button'
import ViewerPanel, { type ViewerPanelProps } from '@/components/ManifestViewer/ui/ViewerPanel.vue'
import { useViewerState } from '@/stores/viewerState'
import Layers from '@/components/ManifestViewer/panels/layers/Layers.vue'
import { ensureArray } from '@/lib/ArrayHelper.ts'
import { getLocalizedValue, type LocalizedValue } from '@/lib/LocalizationHelper.ts'
import type { LayerPreset, LayerState } from '@/components/ManifestViewer/types.ts'

type AnnotationBody = {
  type: string
  value: string | object | Array<string | object>
  format?: string
  purpose?: string
}

const props = defineProps<ViewerPanelProps>()

const viewerState = useViewerState(props.viewerStateId)

const layerPresets = computed((): Array<LayerPreset> => {
  if (!viewerState.hasAnnotations) return []

  return viewerState.annotations.reduce((acc: LayerPreset[], a: any) => {
    if (!Array.isArray(a.motivation) || !a.motivation.includes('supplementing')) return acc

    const body = (ensureArray(a.body) as AnnotationBody[]).find(
      (b) => b.format === 'application/json' && b.type === 'LayerPreset'
    )
    if (body && 'value' in body && 'label' in body)
      // Assuming body.value is an array of LayerState objects
      acc.push({
        id: a.id,
        label:
          getLocalizedValue(body.label as LocalizedValue, viewerState.language) || 'Unnamed Preset',
        layerStates: body.value as LayerState[]
      } as LayerPreset)
    return acc
  }, [] as LayerPreset[])
})

/**
 * Enable/disable panel based on layer availability.
 * Using the hasLayers lifecycle flag for semantic clarity.
 */
const updatePanelState = () => {
  if (viewerState.hasLayers) {
    viewerState.enablePanel(props.panelId)
  } else {
    viewerState.disablePanel(props.panelId)
  }
}

// Watch the semantic lifecycle flag instead of raw layers array
watch(
  () => viewerState.hasLayers,
  () => {
    updatePanelState()
  }
)

// Check on mount
onMounted(() => {
  updatePanelState()
})
</script>