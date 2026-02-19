<template>
  <div class="image-panel w-full h-full relative">
    <ImageViewer
      class="bg-black w-full h-full"
      :key="viewerState.manifestId"
      :tileSources="tileSources"
      :annotations="viewerState.annotations"
      :hovered-annotation-ids="viewerState.hoveredAnnotationIds"
      :annotationStyle="annotationStyle"
      :showAnnotations="viewerState.showAnnotations"
      height="1"
      @annotationClick="onAnnotationClick"
      @annotationMouseOver="onAnnotationMouseOver"
      @annotationMouseLeave="onAnnotationMouseLeave"
      :verbose="viewerState.verbose"
      v-slot="slotProps"
    >
      <div aria-label="Zoom controls" class="absolute flex left-3 bottom-3 z-50 gap-2">
        <ViewerButton icon="pi pi-home" aria-label="Search" @click="slotProps.goHome()" />
        <ViewerButton icon="pi pi-search-plus" aria-label="Zoom in" @click="slotProps.zoomIn()" />
        <ViewerButton
          icon="pi pi-search-minus"
          aria-label="Zoom out"
          @click="slotProps.zoomOut()"
        />
        <ViewerButton
          icon="ci ci-rotate-left"
          aria-label="Zoom out"
          @click="slotProps.rotateLeft()"
        />
        <ViewerButton
          icon="ci ci-rotate-right"
          aria-label="Zoom out"
          @click="slotProps.rotateRight()"
        />
      </div>
      <div aria-label="Viewer toggles" class="absolute flex left-3 top-3 z-50 gap-2">
        <ViewerToggleIcon
          v-model="viewerState.showAnnotations"
          aria-label="Toggle annotation visibility"
          onIcon="ci ci-polygon"
          offIcon="ci ci-polygon"
        />
      </div>
    </ImageViewer>
  </div>
</template>

<script setup lang="ts">
import { useViewerState } from '@/stores/viewerState'
import ViewerToggleIcon from '@/components/ManifestViewer/panels/image/ui/ViewerToggleIcon.vue'
import ViewerButton from '@/components/ManifestViewer/panels/image/ui/ViewerButton.vue'
import {
  ImageViewer,
} from '@/components/ImageViewer'
import { onMounted, ref, watch } from 'vue'
import type { ViewerPanelProps } from '@/components/ManifestViewer/panels/ViewerPanel.vue'
import type { TiledImageOptions } from 'openseadragon'
import { useVault } from '@/lib/useVault.ts'
import { useImageHelper } from '@/lib/useImageHelper.ts'

// props
const props = defineProps<ViewerPanelProps>()

// stores
const viewerState = useViewerState(props.viewerStateId)
const vault = useVault()

// helpers
const { getImageResource, getImageService } = useImageHelper(vault)

// data
const annotationStyle = ref({
  default: {
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    backgroundColor: 'rgba(255, 255, 255, 0)'
  },
  hover: {
    borderColor: 'rgb(255,195,29)',
    borderWidth: 4,
    backgroundColor: 'rgba(255, 255, 255, 0)'
  },
  active: {
    border: '3px solid blue'
  },
  activeHover: {
    border: '3px solid blue',
    backgroundColor: 'rgba(0, 0, 255, 0.1)'
  }
})

const tileSources = ref<TiledImageOptions[]>([])

const initPanel = () => {
  tileSources.value = generateTileSources()
}

// watch canvasId to re-initialize panel when canvas changes
watch(() => viewerState.images,
  (images, previous) => {
    // re-initialize panel
    initPanel()
  }
)

// init panel on mount
onMounted(() => {
  initPanel()
})

const generateTileSources = (): TiledImageOptions[] => {
  if (!viewerState.canvas || !viewerState.images.length) {
    return []
  }

  const ret: TiledImageOptions[] = []

  // layers? use layers to build tile sources with opacity
  if (viewerState.hasLayers) {
    viewerState.layers.forEach((layer, index) => {
      const imageResource = getImageResource(layer.id)
      if (!imageResource) {
        console.warn(`Image resource not found for layer id: ${layer.id}`)
        return null
      }
      const imageService = getImageService(imageResource)
      if (!imageService) {
        console.warn(`Image service not found for layer id: ${layer.id}`)
        return null
      }

      ret.push({
        id: layer.id,
        tileSource: imageService.id,
        index: index, // todo: verify index correctness (order?
        opacity: layer.enabled ? (layer.opacity ?? 1) : 0
      } as TiledImageOptions)
    })
    return ret
  }

  // no layers? use viewerState.images with full opacity
  viewerState.images.forEach((imageId, index) => {
    const imageResource = getImageResource(imageId)
    if (!imageResource) {
      console.warn(`Image resource not found for imageId: ${imageId}`)
      return null
    }
    const imageService = getImageService(imageResource)
    if (!imageService) {
      console.warn(`Image service not found for imageId: ${imageId}`)
      return null
    }

    ret.push({
      id: imageId,
      tileSource: imageService.id,
      index,
      opacity: 1
    } as TiledImageOptions)
  })
  return ret
}

// watch viewerState.layers to update tileSources opacity
watch(
  () => viewerState.layers,
  () => {
    // update tile sources opacity based on layer settings
    tileSources.value.forEach((tileSource: TiledImageOptions) => {
      const layer = viewerState.layers.find((l) => l.id === tileSource.id)
      tileSource.opacity = layer?.enabled ? (layer.opacity ?? 1) : 0
    })
  },
  { deep: true }
)

const onAnnotationClick = (annotationId: string) => {
  // verbose.value && console.log('APP: annotation click', anno, sign)
  // viewerState.setActiveAnnotationId(annotationId)
}
const onAnnotationMouseOver = (annotationId: string) => {
  // verbose.value && console.log('APP: annotation mouse over', anno, sign)
  viewerState.setHoveredAnnotationIds([annotationId])
  // viewerState.hoverSign(sign)
}
const onAnnotationMouseLeave = (annotationId: string) => {
  // verbose.value && console.log('APP: annotation mouse leave', anno, sign)
  viewerState.clearHoveredAnnotationIds()
}
</script>
