<template>
  <ViewerPanel v-bind="props" scrollable>
    <template #options>
      <SelectButton
        v-model="viewerState.atfLevel"
        :options="['line', 'word', 'sign']"
        aria-labelledby="basic"
        class="text-xs"
      />
    </template>
    <ATFTokenizer
      v-for="(transliteration, index) in transliterations"
      :key="index"
      :atf="fixNewlines(transliteration)"
      :hoveredSignSelectors="hoveredATFSigns"
      :_entities="namedEntityStore.namedEntities"
      :level="viewerState.atfLevel"
      @tokenized="onTokenized"
      @mouseleave="onMouseLeave"
      @mouseenter="onMouseOver"
    />
  </ViewerPanel>
</template>

<script setup lang="ts">
import ViewerPanel, {
  type ViewerPanelProps
} from '@/components/ManifestViewer/ui/ViewerPanel.vue'
import { useViewerState } from '@/stores/viewerState'
import { useNamedEntityStore } from '@/stores/namedEntityStore'

import SelectButton from 'primevue/selectbutton'
import ATFTokenizer from 'cune-iiif-orm-atf-utils/src/components/ATFTokenizer.vue'
import type { ATFElement } from 'cune-iiif-orm-atf-utils/src/types'
import { computed, type ComputedRef, ref } from 'vue'
import { ATFSignSelector } from 'cune-iiif-orm-atf-utils/src/lib/ATFSignSelector'
import type { ATFItem } from 'cune-iiif-orm-atf-utils/src'
import { type Sign, SignSelector } from '@/lib/SignSelector'
import { ensureArray } from '@/lib/ArrayHelper'
import type { Annotation } from '@iiif/presentation-3'

type AnnotationBody = {
  type: string
  value: string | object | Array<string | object>
  format?: string
  purpose?: string
}

// props
const props = defineProps<ViewerPanelProps>()

const allATFElements = ref<ATFElement[]>(new Array<ATFElement>())

// stores
const viewerState = useViewerState(props.viewerStateId)
const namedEntityStore = useNamedEntityStore()

// computed
const transliterations = computed((): Array<string> => {
  if (!viewerState.hasAnnotations) {
    return []
  }
  const ret: string[] = []
  viewerState.annotations
    .filter((a: any) => {
      const body = ensureArray(a.body) as AnnotationBody[]
      return (
        Array.isArray(a.motivation) &&
        a.motivation.includes('describing') &&
        (body as any[]).some(
          (b: any) =>
            b.purpose === 'transliterating' && b.format === 'text/x-atf' && b.type === 'TextualBody'
        )
      )
    })
    .forEach((a: any) => {
      const body = (ensureArray(a.body) as AnnotationBody[]).find(
        (b) =>
          'purpose' in b &&
          b.purpose === 'transliterating' &&
          'format' in b &&
          b.format === 'text/x-atf' &&
          'type' in b &&
          b.type === 'TextualBody'
      )
      if (body && 'value' in body) {
        ret.push(body.value as string)
      }
    })
  return ret
})

const hasTransliterations = computed((): boolean => {
  return transliterations.value.length > 0
})

const createSign = (anno: Annotation): Sign => {
  const bodies = ensureArray(anno.body)

  let text = (bodies as any[]).find((item: any) => item?.purpose === 'transliterating')?.value
  let position: any = bodies.find((item: any) => item?.type === 'SignPosition')

  return {
    side: position?.side,
    lineIndex: position?.lineIndex ? parseInt(position?.lineIndex) : null,
    charIndex: position?.charIndex ? parseInt(position?.charIndex) : null,
    wordIndex: position?.wordIndex ? parseInt(position?.wordIndex) : null,
    text: text
  } as Sign
}

// create signs from annotations
const signMap = computed((): Map<string, Sign> => {
  const ret = new Map<string, Sign>()
  viewerState.annotations.forEach((anno: Annotation) => {
    const sign = createSign(anno)
    ret.set(anno.id, sign)
  })
  return ret
})

// state
const hoveredATFSigns: ComputedRef<ATFSignSelector[]> = computed(() => {
  const selectors = Array<ATFSignSelector>()

  // console.log('** hoveredATFSigns update', viewerState.hoveredSigns)
  viewerState.hoveredAnnotationIds.forEach((annoId: string) => {
    const sign = signMap.value.get(annoId)
    if (!sign) return null

    const selector = new ATFSignSelector(sign.side, sign.lineIndex, sign.charIndex, undefined)
    selectors.push(selector)
  })

  // console.log('** hoveredATFSigns update', selectors, hoveredSigns.value)
  return selectors
})

// methods
const fixNewlines = (text: string): string => text.replace(/\r\n/g, '\n')

// events
const onTokenized = (elements: Array<ATFElement>) => {
  allATFElements.value = elements
}

const onMouseOver = (atfItem: ATFItem) => {
  const signSelectors = atfItem.signs.map(
    (sign) =>
      new SignSelector(
        sign.partName as 'obverse' | 'reverse' | 'top' | 'bottom',
        sign.lineNumber,
        null,
        sign.signNumber
      )
  )

  const annotationIds = new Set<string>()

  for (const anno of viewerState.annotations) {
    const sign = signMap.value.get(anno.id)
    if (!sign) continue

    for (const selector of signSelectors) {
      if (selector.matches(sign)) {
        annotationIds.add(anno.id)
        break
      }
    }
  }

  if (annotationIds.size > 0) {
    viewerState.setHoveredAnnotationIds(Array.from(annotationIds))
  }
}

const onMouseLeave = (atfItem: ATFItem) => {
  // verbose.value && console.log('APP: atf mouse leave', element)
  viewerState.clearHoveredAnnotationIds()
}
</script>