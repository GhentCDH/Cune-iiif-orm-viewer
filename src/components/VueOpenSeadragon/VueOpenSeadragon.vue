<script setup lang="ts">
import { onMounted, onUnmounted, ref, toRefs, watch, watchEffect } from 'vue'

import OpenSeadragon, {
  type PanEvent,
  Point,
  type RotateEvent,
  type TiledImageOptions,
  Viewer as OpenSeaDragonViewer,
  type Options as OpenSeadragonOptions,
  type ZoomEvent
} from 'openseadragon'
import {
  createOSDAnnotator,
  type ImageAnnotation,
  type OpenSeadragonAnnotator,
  UserSelectAction,
  type W3CImageAnnotation
} from '@annotorious/openseadragon'
import { type DrawingStyle, W3CImageFormat } from '@annotorious/annotorious'
import '@annotorious/openseadragon/annotorious-openseadragon.css'
import { type VueOpenSeadragonProps } from './types'

// event configuration
const emit = defineEmits([
  'ready',
  'zoom',
  'pan',
  'rotate',
  'clickAnnotation',
  'mouseEnterAnnotation',
  'mouseLeaveAnnotation'
])

// props
const props = withDefaults(defineProps<VueOpenSeadragonProps>(), {
  options: () => ({}),
  annotoriousOptions: () => ({}),
  tileSources: () => [],
  annotations: () => [],
  rotation: 0,
  showAnnotations: true,
  verbose: false,
  annotationStyle: () => {
    return {} as DrawingStyle
  }
})

const { rotation, zoom, pan, tileSources, annotations, showAnnotations, verbose } = toRefs(props)

// openseadragon + annotorious
const osdContainer = ref<HTMLElement>()
let osd: OpenSeaDragonViewer | null = null
let annotorious: OpenSeadragonAnnotator<ImageAnnotation, W3CImageAnnotation> | null = null

// Track OSD handler function references so they can be removed before re-init
const osdHandlerRegistry: Array<{ event: string; fn: Function }> = []

function addOsdHandler(event: string, fn: Function) {
  osd!.addHandler(event as any, fn as any)
  osdHandlerRegistry.push({ event, fn })
}

function clearOsdHandlers() {
  for (const { event, fn } of osdHandlerRegistry) {
    osd?.removeHandler(event as any, fn as any)
  }
  osdHandlerRegistry.length = 0
}

// annotation hover control
const hoveredAnnotationIds = new Map()

// watch viewport props (rotation, zoom, pan)
watchEffect(() => {
  if (rotation.value == null) return
  if (rotation.value === osd?.viewport.getRotation()) return
  osd?.viewport.setRotation(rotation.value)
})

watchEffect(() => {
  if (zoom.value == null) return
  if (zoom.value === osd?.viewport.getZoom()) return
  osd?.viewport.zoomTo(zoom.value)
})

watchEffect(() => {
  if (pan.value == null) return
  if (pan.value.x && pan.value.y) {
    osd?.viewport.panTo(new Point(pan.value.x, pan.value.y))
  }
})

// watch showAnnotations
watch(showAnnotations, () => {
  annotorious && annotorious.setVisible(showAnnotations.value)
})

// watch annotations
watch(annotations, () => {
  if (!annotorious || !annotations.value) return

  // Load annotations into Annotorious.
  if (annotations.value.length) {
    annotorious.setAnnotations(annotations.value, true)
  }
})

// watch tile sources
watch(
  tileSources,
  (tileSources, previous) => {
    if (!osd) return

    // console.log('VueOpenSeadragon: tileSources changed', tileSources, previous)

    // detect if tileSources length changed
    let changed = false
    if (!previous || previous.length !== tileSources.length) {
      changed = true
    } else {
      // check if sets of tileSource urls are different
      const prevSet = new Set(previous.map((ts) => ts.tileSource))
      const newSet = new Set(tileSources.map((ts) => ts.tileSource))
      for (const src of newSet) {
        if (!prevSet.has(src)) {
          changed = true
          break
        }
      }
    }

    // changed? update tile sources
    if (changed) {
      // remove previous tile sources
      if (previous.length !== 0) {
        for (let i = previous.length - 1; i >= 0; i--) {
          osd.world.removeItem(osd.world.getItemAt(i))
        }
      }
      // add new tile sources
      if (tileSources.length > 0) {
        tileSources.forEach((tileSource) => {
          osd && osd.addTiledImage({ ...tileSource })
        })
      }
    }

    // no changes, update opacity
    tileSources.forEach((tileSource: TiledImageOptions, index: number) => {
      osd &&
        osd.world.getItemAt(index) &&
        osd.world.getItemAt(index).setOpacity(tileSource.opacity ?? 0)
    })
  },
  { deep: true }
)

/* init viewer */
const initViewer = () => {
  // Clean up any previous instance before re-initialising (defensive)
  clearOsdHandlers()
  if (annotorious) {
    annotorious.destroy()
    annotorious = null
  }

  // Initialize VueOpenSeadragon
  const osdConfig: OpenSeadragonOptions = {
    degrees: rotation.value ?? 0,
    defaultZoomLevel: zoom.value ?? 0,
    ...props.options
  }
  osdConfig.element = osdContainer.value

  osd = OpenSeadragon(osdConfig)
  if (!osd) {
    console.error('Error initializing VueOpenSeadragon')
    return
  }

  verbose.value && console.log('Init OSD')

  // Add event listeners (tracked so they can be removed on cleanup)
  addOsdHandler('zoom', (event: ZoomEvent): void => {
    verbose.value && console.log('* osd: emit zoom event ', event)
    emit('zoom', event.zoom)
  })
  addOsdHandler('pan', (event: PanEvent) => {
    verbose.value && console.log('* osd: emit pan event', event)
    emit('pan', { x: event.center.x, y: event.center.y })
  })
  addOsdHandler('rotate', (event: RotateEvent) => {
    verbose.value && console.log('* osd: emit rotate event', event)
    emit('rotate', event.degrees)
  })

  // Init tilesources
  tileSources.value.forEach((tileSource) => {
    osd?.addTiledImage(tileSource)
  })

  // Set initial viewport
  if (pan.value) {
    if (pan.value.x && pan.value.y) {
      osd?.viewport.panTo(new Point(pan.value.x, pan.value.y))
    }
  }

  // Initialize Annotorious
  // todo: fix type error
  // @ts-ignore
  annotorious = createOSDAnnotator(osd, {
    drawingEnabled: false,
    userSelectAction: UserSelectAction.SELECT,
    style: props.annotationStyle,
    adapter: W3CImageFormat(''),
    ...props.annotoriousOptions
  })

  if (!annotorious) {
    console.error('Error initializing Annotorious')
    return
  }

  // Add event listeners
  annotorious.on('clickAnnotation', (anno: W3CImageAnnotation, e: PointerEvent) => {
    verbose.value && console.log('* osd: emit clickiAnnotation event', anno)
    e.stopPropagation()
    emit('clickAnnotation', anno.id)
  })

  annotorious.on('mouseEnterAnnotation', (anno: W3CImageAnnotation) => {
    verbose.value && console.log('* osd: emit mouseEnterAnnotation event', anno)
    emit('mouseEnterAnnotation', anno.id)
  })

  annotorious.on('mouseLeaveAnnotation', (anno: W3CImageAnnotation) => {
    verbose.value && console.log('* osd: emit mouseLeaveAnnotation event', anno)
    emit('mouseLeaveAnnotation', anno.id)
  })

  // Load annotations into Annotorious
  if (annotorious && annotations.value.length > 0) {
    annotorious.setAnnotations(annotations.value)
  }

  // emit ready
  emit('ready', osd, annotorious)
}

onMounted(() => {
  verbose.value && console.log('Mount VueOpenSeadragon')
  initViewer()
})

onUnmounted(() => {
  verbose.value && console.log('Destroy OSD and Annotorious')
  clearOsdHandlers()
  if (annotorious) {
    annotorious.destroy()
    annotorious = null
  }
  if (osd) {
    osd.destroy()
    osd = null
  }
})
</script>

<template>
  <div class="vue-openseadragon">
    <div class="vue-openseadragon__viewer" ref="osdContainer"></div>
    <div class="vue-openseadragon__overlay">
      <slot :osd="osd" />
    </div>
  </div>
</template>

<style>
.vue-openseadragon {
  position: relative;

  .vue-openseadragon__viewer {
    width: 100%;
    height: 100%;
  }

  .vue-openseadragon__overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;

    * {
      pointer-events: auto;
    }
  }
}
</style>
