<script setup lang="ts">
import { computed, onMounted, ref, toRefs, watch } from 'vue'

import { type ImageViewerProps } from '@/components/ImageViewer/types'

import VueOpenSeadragon from '../VueOpenSeadragon/VueOpenSeadragon.vue'
import {
  Viewer as OpenSeadragonViewer,
  type Options as OpenSeadragonOptions,
  type Viewer
} from 'openseadragon'
import type {
  AnnotationState,
  ImageAnnotation,
  OpenSeadragonAnnotator,
  W3CImageAnnotation
} from '@annotorious/openseadragon'
import type { DrawingStyle } from '@annotorious/annotorious'
import type { Annotation } from '@iiif/presentation-3'

type AnnotationMap = Map<string, Annotation>

// event configuration
const emit = defineEmits<{
  ready: [osd: Viewer, annotorious: OpenSeadragonAnnotator]
  annotationClick: [annotationId: string]
  annotationMouseOver: [annotationId: string]
  annotationMouseLeave: [annotationId: string]
}>()

// props
const props = withDefaults(defineProps<ImageViewerProps>(), {
  annotationStyle: () => {
    return {
      default: {
        borderWidth: 1.3,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(255, 255, 255, 0.0)'
      },
      hover: {
        borderWidth: 1.3,
        borderColor: 'rgba(255, 255, 0, 0.6)'
      },
      active: {
        borderWidth: 1.3,
        borderColor: 'rgba(0, 255, 0, 0.6)'
      },
      activeHover: {
        borderWidth: 1.3,
        borderColor: 'rgba(0, 0, 255, 0.6)'
      }
    }
  },
  tileSources: () => [],
  annotations: () => [],
  hoveredAnnotationIds: () => [],
  activeAnnotationIds: () => [],
  showAnnotations: true,
  verbose: false,
  rotation: 0
})

// get root element based on ref name
const osd = ref<OpenSeadragonViewer>()
const annotorious = ref<OpenSeadragonAnnotator>()
const osdOptions: OpenSeadragonOptions = {
  showZoomControl: false,
  showHomeControl: false,
  showFullPageControl: false,
  showFlipControl: false,
  showRotationControl: false,
  animationTime: 0.2,
  // @ts-ignore
  silenceMultiImageWarnings: true
}

const {
  verbose,
  showAnnotations,
  tileSources,
  annotations,
  activeAnnotationIds,
  hoveredAnnotationIds
} = toRefs(props)

const annotationsMap = computed<AnnotationMap>(() => {
  const map: AnnotationMap = new Map()
  annotations.value.forEach((anno: Annotation) => {
    map.set(anno.id, anno)
  })
  return map
})

const annotationIdSet = new Set<string>()

// watch activeAnnotationIds
watch(
  activeAnnotationIds.value, // avoids a deep watch
  (now: string[], old: string[]) => {
    verbose.value && console.log('* activeAnnotationIds updated', activeAnnotationIds.value)
    if (now.length === 0 && old.length === 0) return
    updateAnnotationStyles([...old, ...now])
    //
    // const mergedIds = new Set<string>([...old, ...now])
    // if (mergedIds.size !== 0) {
    //   updateAnnotationStyles(Array.from(mergedIds))
    // }
  }
)

// watch activeAnnotationIds
watch(
  hoveredAnnotationIds, // avoids a deep watch
  (now: string[], old: string[]) => {
    verbose.value && console.log('* hoveredAnnotationIds updated', hoveredAnnotationIds.value)
    if (now.length === 0 && old.length === 0) return
    updateAnnotationStyles([...old, ...now])
    // const mergedIds = new Set<string>([...old, ...now])
    // if (mergedIds.size !== 0) {
    //   updateAnnotationStyles(Array.from(mergedIds))
    // }
  }
)

// onMounted
onMounted(() => {
  verbose.value && console.log('* canvas viewer mounted *')
})

const initEvents = () => {
  if (!osd.value) return

  if (!annotorious.value) return

  annotorious.value.on('clickAnnotation', (anno: ImageAnnotation, e: PointerEvent) => {
    e.stopPropagation()
    onAnnotationClick(anno.id)
  })

  annotorious.value.on('mouseEnterAnnotation', (anno: ImageAnnotation) => {
    onAnnotationMouseOver(anno.id)
  })

  annotorious.value.on('mouseLeaveAnnotation', (anno: ImageAnnotation) => {
    onAnnotationMouseOut(anno.id)
  })
}

const getAnnotation = (id: string): Annotation => {
  return annotationsMap.value.get(id) as Annotation
}

/* styling */
const convertStyle = (style: any) => {
  return {
    stroke: style.borderColor,
    strokeWidth: style.borderWidth,
    fill: style.backgroundColor
  }
}

const getAnnotationStyle = (anno: Annotation) => {
  const signIsHovered = hoveredAnnotationIds.value.includes(anno.id)
  if (!showAnnotations.value && !signIsHovered) return { opacity: 0 }

  const signIsActive = activeAnnotationIds.value.includes(anno.id)

  const style =
    signIsHovered && signIsActive
      ? props.annotationStyle.activeHover
      : signIsActive
        ? props.annotationStyle.active
        : signIsHovered
          ? props.annotationStyle.hover
          : props.annotationStyle.default

  return { ...props.annotationStyle.default, ...style }
}

const annotationStyler = (
  anno: ImageAnnotation,
  state?: AnnotationState | undefined
): DrawingStyle => {
  return convertStyle(getAnnotationStyle(getAnnotation(anno.id) as Annotation))
}

const updateAnnotationStyles = (annotationIds?: string[]) => {
  // trigger annotorious redraw
  annotorious.value && annotorious.value.setStyle(annotationStyler)
}
// }, 5);

/* event handlers */
const onAnnotationClick = (annotationId: string) => {
  emit('annotationClick', annotationId)
}

const onAnnotationMouseOver = (annotationId: string) => {
  if (!annotationIdSet.has(annotationId)) {
    annotationIdSet.add(annotationId)
    verbose.value && console.log('* emit annotationMouseOver event', annotationId)
    emit('annotationMouseOver', annotationId)
  }
}

const onAnnotationMouseOut = (annotationId: string) => {
  if (annotationIdSet.has(annotationId)) {
    annotationIdSet.delete(annotationId)
    verbose.value && console.log('* emit annotationMouseLeave event', annotationId)
    emit('annotationMouseLeave', annotationId)
  }
}

const onReady = (osdInstance: OpenSeadragonViewer, annotoriousInstance: OpenSeadragonAnnotator) => {
  osd.value = osdInstance
  annotorious.value = annotoriousInstance

  // init events
  initEvents()

  // emit event
  verbose.value && console.log('* emit ready event', osd, annotorious)
  emit('ready', osd.value, annotorious.value)
}

// slot methods
const zoomIn = () => {
  osd.value?.viewport.zoomBy(1.2)
}

const zoomOut = () => {
  osd.value?.viewport.zoomBy(0.8)
}

const goHome = () => {
  osd.value?.viewport.setRotation(0)
  osd.value?.viewport.goHome()
}

const rotateLeft = () => {
  osd.value?.viewport.setRotation(osd.value?.viewport.getRotation() - 90)
}

const rotateRight = () => {
  osd.value?.viewport.setRotation(osd.value?.viewport.getRotation() + 90)
}
</script>

<template>
  <div class="canvas-viewer">
    <VueOpenSeadragon
      :options="osdOptions"
      :tile-sources="tileSources"
      :annotations="annotations as W3CImageAnnotation[]"
      :rotation="rotation"
      :annotationStyle="annotationStyler"
      :verbose="verbose"
      :showAnnotations="showAnnotations"
      @ready="onReady"
      @click-annotation="onAnnotationClick"
      @mouse-enter-annotation="onAnnotationMouseOver"
      @mouse-leave-annotation="onAnnotationMouseOut"
    >
      <slot
        :zoomIn="zoomIn"
        :zoomOut="zoomOut"
        :goHome="goHome"
        :osd="osd"
        :rotateLeft="rotateLeft"
        :rotateRight="rotateRight"
      />
    </VueOpenSeadragon>
  </div>
</template>

<style>
.canvas-viewer {
  position: relative;
  width: 100%;
  height: 100%;

  .vue-openseadragon {
    position: relative;
    width: 100%;
    height: 100%;
  }
}
</style>
