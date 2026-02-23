<template>
  <ViewerPanel v-bind="props" scrollable>
    <template #options>
      <div class="flex gap-1 right">
        <Button label="Color" size="small" severity="secondary" @click="viewerState.setLayerPreset(LayerPreset.Color)"></Button>
        <Button label="Sketch" size="small" severity="secondary" @click="viewerState.setLayerPreset(LayerPreset.Sketch)"></Button>
        <Button label="Combined" size="small" severity="secondary" @click="viewerState.setLayerPreset(LayerPreset.Combined)"></Button>
      </div>
    </template>
    <Layers v-model="viewerState.layers" />
  </ViewerPanel>
</template>

<script setup lang="ts">
import { watch, onMounted } from 'vue'
import Button from 'primevue/button'
import ViewerPanel, { type ViewerPanelProps } from '@/components/ManifestViewer/ui/ViewerPanel.vue'
import { LayerPreset, useViewerState } from '@/stores/viewerState'
import Layers from '@/components/ManifestViewer/panels/layers/Layers.vue'

const props = defineProps<ViewerPanelProps>()

const viewerState = useViewerState(props.viewerStateId)

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
watch(() => viewerState.hasLayers, () => {
  updatePanelState()
})

// Check on mount
onMounted(() => {
  updatePanelState()
})
</script>