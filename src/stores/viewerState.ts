import { ref, computed, type Ref, type ComputedRef, watch } from 'vue'
import { defineStore } from 'pinia'

import { useVault } from '@/lib/useVault.ts'
import { useCanvasHelper } from '@/lib/useCanvasHelper.ts'
import { getFirstLocalizedValue } from '@/lib/LocalizationHelper'
import { useImageHelper } from '@/lib/useImageHelper.ts'

import type { Canvas, Manifest, Annotation } from '@iiif/presentation-3'
import { useAnnotationHelper } from '@/lib/useAnnotationHelper.ts'
import type {
  Layer,
  ViewerPanelState,
  ViewerPanelStateList
} from '@/components/ManifestViewer/types'

export enum LayerPreset {
  Color = 'color',
  Sketch = 'sketch',
  Combined = 'combined'
}

type ViewerPanelStateMap = { [key: string]: ViewerPanelState }

interface Viewport {
  center: {
    x: number | null
    y: number | null
  }
  zoom: number
  rotation: number
}

const vault = useVault()

const { getAllImages, getChoices } = useCanvasHelper(vault)
const { createImageThumbnail } = useImageHelper(vault)
const { getCanvasAnnotations } = useAnnotationHelper(vault)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useViewerState = (storeId?: string, viewerPanelToggleDefaults?: ViewerPanelStateList): any => {
  return defineStore(storeId ?? 'viewer-state', () => {

  // resource state
  const manifestId = ref<string | null>(null)
  const canvasId = ref<string | null>(null)
  const manifest: Ref<Manifest|null> = ref(null)

  const manifestLoaded = ref(false)

  const verbose = ref(true)

  // language state
  const language = ref('en')

  // panel
  const panels = ref<ViewerPanelStateMap>({})
  if (viewerPanelToggleDefaults) {
    for (const panelState of viewerPanelToggleDefaults) {
      panels.value[panelState.id] = {...panelState}
    }
  }

  // annotation state
  const showAnnotations = ref(true)

  const atfLevel = ref('sign')

  const layers: Ref<Layer[]> = ref([])
  const layerPreset = ref<String>(LayerPreset.Combined)

  const hoveredAnnotationIds = ref<string[]>([])
  const selectedAnnotationIds = ref<string[]>([])

  // viewport state
  const viewPort = ref<Viewport>({
    center: {
      x: null,
      y: null,
    },
    zoom: 1,
    rotation: 0
  })

  // image resources on the current canvas
  const images = computed(() => {
    verbose.value && console.log('Reset images for canvas', canvasId.value)
    if (!canvasId.value) return []
    const images = getAllImages(canvasId.value)
    verbose.value && console.log('Images for canvas', canvasId.value, images)
    return images
  })

  // watch canvasId to reset layers
  watch(canvasId, (newCanvasId) => {
    if (!newCanvasId) {
      layers.value = []
      return
    }

    const choices = getChoices(newCanvasId)
    const newLayers = []
    if (choices && choices.type === 'single-choice') {
      for (const choice of choices.items) {
        newLayers.push({
          id: choice.id,
          opacity: 1,
          enabled: choice.selected ?? false,
          label: choice.label ? getFirstLocalizedValue(choice.label as any, language.value) : '',
          thumbnail: createImageThumbnail(choice.id)
        } as Layer)
      }
    }
    layers.value = newLayers
    layerPreset.value = LayerPreset.Combined
  })

  const canvas: ComputedRef<Canvas | null> = computed(() => {
    if (!canvasId.value) return null
    console.log(vault.getObject(canvasId.value))
    return vault.getObject(canvasId.value) as Canvas
  })

  // Annotations - use ref + watch for async loading
  const annotations = ref<Annotation[]>([])
  const annotationsLoading = ref(false)

  // Watch canvasId to load annotations
  watch(canvasId, async (newCanvasId) => {
    if (!newCanvasId) {
      annotations.value = []
      return
    }

    verbose.value && console.log('Loading annotations for canvas', newCanvasId)
    annotationsLoading.value = true
    try {
      annotations.value = await getCanvasAnnotations(newCanvasId)
    } catch (error) {
      console.error('Failed to load annotations for canvas', newCanvasId, error)
      annotations.value = []
    } finally {
      annotationsLoading.value = false
    }
  }, { immediate: true })

  // Computed lifecycle states - makes watching more semantic
  const isReady = computed(() => manifestLoaded.value && canvasId.value !== null)
  const hasImages = computed(() => images.value.length > 0)
  const hasLayers = computed(() => layers.value.length > 0)
  const hasAnnotations = computed(() => annotations.value.length > 0)

  // manifest state actions
  const setManifestId = (id: string): void => {
    manifestId.value = id
  }

  const setCanvasId = (id: string): void => {
    canvasId.value = id
  }

  // panel state actions
  const panelIsVisible = computed(() => (panelId: string): boolean => {
    return panels.value?.[panelId]?.visible ?? false
  })

  const panelIsEnabled = computed(() => (panelId: string): boolean => {
    return panels.value?.[panelId]?.enabled ?? false
  })

  const setPanelVisibility = (panelId: string, visible: boolean) => {
    if (panels.value?.[panelId]) {
      panels.value[panelId].visible = visible
    }
  }

  function togglePanelVisibility(panelId: string) {
    verbose.value && console.log('Toggling panel visibility', panelId)
    verbose.value && console.log('Current panels state', panels.value)
    if (panels.value?.[panelId]) {
      panels.value[panelId].visible = !panels.value[panelId].visible
      verbose.value && console.log('Toggled panel visibility', panelId, panels.value[panelId].visible)
    }
  }

  const setPanelOptionsVisibility = (panelId: string, visible: boolean) => {
    if (panels.value?.[panelId]) {
      panels.value[panelId].optionsVisible = visible
    }
  }

  function togglePanelOptionsVisibility(panelId: string) {
    if (panels.value?.[panelId]) {
      panels.value[panelId].optionsVisible = !panels.value[panelId].optionsVisible
    }
  }

  const enablePanel = (panelId: string) => {
    if (panels.value?.[panelId]) {
      panels.value[panelId].enabled = true
    }
  }

  const disablePanel = (panelId: string) => {
    if (panels.value?.[panelId]) {
      panels.value[panelId].enabled = false
    }
  }

  // layer actions
  function setLayers(l: Layer[]) {
    const applyPreset = layers.value.length === 0
    layers.value = l
    if (applyPreset) {
      setLayerPreset(layerPreset.value as LayerPreset)
    }
  }

  // viewport state
  function setRotation(rotation: number) {
    viewPort.value.rotation = rotation
  }

  function setZoom(zoom: number) {
    viewPort.value.zoom = zoom
  }

  function setCenter(x: number, y: number) {
    viewPort.value.center = {x, y}
  }

  function setLayerPreset(preset: LayerPreset) {
    layerPreset.value = preset

    const newLayers: Layer[] = [...layers.value].map((l) => {
      l.enabled = false
      return l
    })

    if (preset === LayerPreset.Color) {
      const index = newLayers.findIndex((l) => l.label === 'Color B')
      if (index !== -1) {
        newLayers[index].enabled = true
        newLayers[index].opacity = 1
      }
    }

    if (preset === LayerPreset.Sketch) {
      const index = newLayers.findIndex((l) => l.label === 'Sketch Hard')
      if (index !== -1) {
        newLayers[index].enabled = true
        newLayers[index].opacity = 1
      }
    }

    if (preset === LayerPreset.Combined) {
      let index
      index = newLayers.findIndex((l) => l.label === 'Color B')
      if (index !== -1) {
        newLayers[index].enabled = true
        newLayers[index].opacity = 1
      }

      index = newLayers.findIndex((l) => l.label === 'Sketch Hard')
      if (index !== -1) {
        newLayers[index].enabled = true
        newLayers[index].opacity = 0.2
      }
    }

    layers.value = newLayers
  }

  function updateLayerOpacity(layerId: string, opacity: number) {
    const index = layers.value.findIndex((l) => l.id === layerId)
    if (index !== -1) {
      layers.value[index].opacity = opacity
    }
  }

  function updateLayerVisibility(layerId: string, enabled: boolean) {
    const index = layers.value.findIndex((l) => l.id === layerId)
    if (index !== -1) {
      layers.value[index].enabled = enabled
    }
  }

  const loadManifest = async (id: string) => {
    resetManifestState()
    try {
      const manifestObject = await vault.loadManifestObject(id)
      if (!manifestObject) {
        throw new Error('Manifest could not be loaded')
      }
      manifestId.value = id
      manifest.value = manifestObject as Manifest

      const canvasIds = manifestObject.items.map(item => item.id)
      if (canvasIds.length === 0) {
        throw new Error('Manifest has no canvases')
      }

      canvasId.value = canvasIds[0]
      manifestLoaded.value = true
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error'
      console.error('Failed to load manifest', errorMessage)
      resetManifestState()
    }
  }

  const resetManifestState = () => {
    manifestId.value = null
    manifest.value = null
    canvasId.value = null
    manifestLoaded.value = false
  }

  const initPanelStates = (panelStates: ViewerPanelStateList) => {
    for (const panelState of panelStates) {
      panels.value[panelState.id] = { ...panelState }
    }
  }

  const setVerbose = (v: boolean) => {
    verbose.value = v
  }

  const setHoveredAnnotationIds = (ids: string[]) => {
    hoveredAnnotationIds.value = ids
  }

  const clearHoveredAnnotationIds = () => {
    hoveredAnnotationIds.value = []
  }

  // exports
  return {
    panels,
    language,
    // manifest
    manifestId,
    canvasId,
    manifestLoaded,
    loadManifest,
    setCanvasId,
    images,
    annotations,
    annotationsLoading,
    canvas,
    manifest,
    // lifecycle state flags
    isReady,
    hasImages,
    hasLayers,
    hasAnnotations,
    /* panels */
    panelIsVisible,
    panelIsEnabled,
    setPanelVisibility,
    setPanelOptionsVisibility,
    enablePanel,
    disablePanel,
    togglePanelVisibility,
    togglePanelOptionsVisibility,
    /* layers */
    layers,
    setLayers,
    layerPreset,
    setLayerPreset,
    updateLayerOpacity,
    updateLayerVisibility,
    // annotations
    hoveredAnnotationIds,
    setHoveredAnnotationIds,
    clearHoveredAnnotationIds,
    showAnnotations,
    // transliteration panel
    atfLevel,
    // viewport
    viewPort,
    setCenter, setZoom, setRotation,
    // settings
    setVerbose, verbose,
    initPanelStates
  }
  })()
}
