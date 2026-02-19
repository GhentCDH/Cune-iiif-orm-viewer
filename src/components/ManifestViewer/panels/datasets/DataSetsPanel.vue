<template>
  <ViewerPanel v-bind="props" scrollable>
    <h2>Images</h2>
    <ul class="list-inside list-disc  mb-2">
      <li v-for="(resource, index) in formatImageResources" :key="index">
        <a target="_blank" :href="resource.uri">{{ resource.label }}</a>
      </li>
    </ul>
    <h2>Data</h2>
    <ul class="list-inside list-disc mb-2">
      <li v-for="(resource, index) in formatSeeAlso" :key="index">
        <a target="_blank" :href="resource.uri">{{ resource.label }}</a>
      </li>
    </ul>
  </ViewerPanel>
</template>

<script setup lang="ts">
import { watch, onMounted, toValue, computed } from 'vue'
import { useViewerState } from '@/stores/viewerState'
import type { DataSource } from './types'
import { useVault } from '@/lib/useVault.ts'

import ViewerPanel, { type ViewerPanelProps } from '@/components/ManifestViewer/panels/ViewerPanel.vue'
import { useLocalizationHelper } from '@/lib/useLocalizationHelper.ts'

const props = defineProps<ViewerPanelProps>()

const viewerState = useViewerState(props.viewerStateId)
const vault = useVault()

const { getFirstLocalizedValue } = useLocalizationHelper()

// Initialize on mount in case manifest is already loaded
onMounted(() => {
  // initState()
})

// Watch for manifest to be loaded
watch(() => viewerState.manifestLoaded, (loaded) => {
  // initState()
})

const resetState = () => {
  viewerState.disablePanel(props.panelId)
}

const formatSeeAlso = computed((): DataSource[] => {
  if (!viewerState.manifestLoaded) return []

  if (!viewerState.manifest || !('seeAlso' in viewerState.manifest) || !viewerState.manifest.seeAlso || viewerState.manifest.seeAlso.length === 0) return []

  const results: DataSource[] = []
  for (const entry of viewerState.manifest.seeAlso) {
    if ('id' in entry) {
      const label = getFirstLocalizedValue(entry?.['label'], toValue(viewerState.language), 'Untitled')
      results.push({
        uri: entry['id'],
        label,
      })
    }
  }
  return results
})

const formatImageResources = computed((): DataSource[] => {
  if (!viewerState.images || viewerState.images.length === 0) return []

  const results: DataSource[] = []
  for (const imageId of viewerState.images) {
    const imageResource = vault.getObject(imageId)
    if (!imageResource) continue
    if ('id' in imageResource) {
      const label = getFirstLocalizedValue(imageResource['label'], toValue(imageResource['label'], 'Untitled'))
      results.push({
        uri: imageResource['id'],
        label,
      })
    }
  }
  return results
})
</script>
