<template>
  <ViewerPanel v-bind="props" scrollable>
    <Metadata :metadata="metadata" :language="viewerState.language" v-if="hasMetadata" />
  </ViewerPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useViewerState } from '@/stores/viewerState'

import ViewerPanel, { type ViewerPanelProps } from '@/components/ManifestViewer/ui/ViewerPanel.vue'
import Metadata from '@/components/ManifestViewer/panels/info/Metadata.vue'

const props = defineProps<ViewerPanelProps>()

const viewerState = useViewerState(props.viewerStateId)

// computed hasMetadata
const hasMetadata = computed<boolean>(() => {
  return (
    viewerState.isReady &&
    Array.isArray(viewerState.manifest?.metadata) &&
    viewerState.manifest?.metadata.length > 0
  )
})

const metadata = computed<object>(() => {
  const metadata = []
  // add manifest label to metadata
  if (viewerState.manifest?.label) {
    metadata.push({
      label: { en: ['Label'] },
      value: viewerState.manifest.label,
    })
  }

  // add manifest metadata to metadata
  if (Array.isArray(viewerState.manifest?.metadata)) {
    for (const entry of viewerState.manifest.metadata) {
      metadata.push(entry)
    }
  }

  return metadata
})

const label = computed(() => {
  return viewerState.manifest?.label ?? { en: ['Untitled'] }
})
</script>