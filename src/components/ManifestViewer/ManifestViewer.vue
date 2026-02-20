<script setup lang="ts">
import { computed, reactive, ref, toRefs, watch } from 'vue'

// stores
import { useViewerState } from '@/stores/viewerState'

import type { ViewerPanelStateList } from './types'

import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'

// helpers
import { useElementBounding } from '@vueuse/core'
import InfoPanel from '@/components/ManifestViewer/panels/info/InfoPanel.vue'
import TranslationPanel from '@/components/ManifestViewer/panels/translation/TranslationPanel.vue'
import TransliterationPanel from '@/components/ManifestViewer/panels/transliteration/TransliterationPanel.vue'
import ImagePanel from '@/components/ManifestViewer/panels/image/ImagePanel.vue'
import LayersPanel from '@/components/ManifestViewer/panels/layers/LayersPanel.vue'
import DataSetsPanel from '@/components/ManifestViewer/panels/datasets/DataSetsPanel.vue'
import SidebarToggle from '@/components/ManifestViewer/ui/SidebarToggle.vue'
import type { ViewerPanel, ManifestViewerProps } from '@/components/ManifestViewer/types'

const props = withDefaults(defineProps<ManifestViewerProps>(), {
  verbose: false
})

const { manifestId, viewerStateId, verbose } = toRefs(props)

const el = ref(null)
const rect = reactive(useElementBounding(el))

// methods
const layerWidth = computed(() => {
  const width = rect.width ? (300 / rect.width) * 100 : 20
  // console.log('layerWidth', width)
  return width
})

const minWidth = computed(() => {
  const width = rect.width ? (300 / rect.width) * 100 : 10
  // console.log('minwidth', width)
  return width
})

// panels
// todo: move to store
let viewerPanels: Array<ViewerPanel> = [
  {
    id: 'layers',
    label: 'Layers',
    component: LayersPanel,
    icon: 'ci ci-layers-thin ci-md',
    visible: true,
    enabled: true,
    panelWeight: 10,
    iconWeight: 10,
    minWidth: 100,
    width: 220,
    maxWidth: 300
  },
  {
    id: 'tablet',
    label: 'Tablet',
    icon: 'ci ci-cuneiform ci-md',
    component: ImagePanel,
    visible: true,
    enabled: true,
    panelWeight: 20,
    iconWeight: 20
  },
  {
    id: 'transliteration',
    label: 'Transliteration',
    icon: 'ci ci-text-left ci-md',
    component: TransliterationPanel,
    visible: true,
    enabled: true,
    panelWeight: 30,
    iconWeight: 30,
    minWidth: 150,
    width: 200
  },
  {
    id: 'translation',
    label: 'Translation',
    icon: 'ci ci-translate ci-md',
    component: TranslationPanel,
    visible: false,
    enabled: true,
    panelWeight: 40,
    iconWeight: 40,
    minWidth: 150,
    width: 200
  },
  {
    id: 'data',
    label: 'Data sets',
    icon: 'ci ci-share ci-md',
    component: DataSetsPanel,
    visible: false,
    enabled: true,
    panelWeight: 50,
    iconWeight: 50,
    minWidth: 150,
    width: 200
  },
  {
    id: 'metadata',
    label: 'Metadata',
    icon: 'ci ci-info ci-md',
    component: InfoPanel,
    visible: false,
    enabled: true,
    panelWeight: 60,
    iconWeight: 60,
    minWidth: 250,
    width: 250
  }
]

const panelDefaults: ViewerPanelStateList = viewerPanels.map((panel) => {
  return {
    id: panel.id,
    enabled: true, // Panels determine their own enabled state based on manifest content
    visible: panel.visible ?? false,
    optionsVisible: false
  }
})

// init viewer state
const viewerState = useViewerState(viewerStateId.value, panelDefaults)
viewerState.initPanelStates(panelDefaults)

// Watch manifestId and load manifest when it changes
watch(manifestId, (newManifestId) => {
  if (newManifestId) {
    viewerState.loadManifest(newManifestId)
  }
}, { immediate: true })

// order panels by iconWeight
// viewerPanels = viewerPanels.sort((a, b) => a.iconWeight - b.iconWeight)
</script>

<template>
  <div class="cune-iiif-orm-viewer flex overflow-hidden" v-if="viewerState.manifestLoaded">
    <div class="flex px-1.5 pt-4 pb-2 min-h-full max-h-full flex-col gap-2 bg-gray-100">
      <SidebarToggle
        v-for="panel in viewerPanels"
        :key="panel.id"
        _v-show="viewerState.panelIsEnabled(panel.id)"
        :active="viewerState.panelIsVisible(panel.id)"
        :icon="panel.icon"
        :title="panel.label"
        @toggle="viewerState.togglePanelVisibility(panel.id)"
      />
    </div>
    <Splitpanes class="flex-1 overflow-hidden bg-white">
      <template v-for="panel in viewerPanels" :key="panel.id">
        <Pane
          v-if="viewerState.panelIsVisible(panel.id)"
          :_size="layerWidth"
          :_minSize="layerWidth"
          :_maxSize="layerWidth"
          class="border border-surface-200"
        >
          <component
            :is="panel.component"
            :viewer-state-id="viewerStateId"
            :panel-id="panel.id"
            :title="panel.label"
          ></component>
        </Pane>
      </template>
    </Splitpanes>
  </div>
</template>

<style lang="scss">
.splitpanes--vertical {
  .splitpanes__pane {
    transition: none;
  }

  .splitpanes__splitter {
    background-color: var(--surface-200);
    width: 4px;
    cursor: col-resize;

    &:hover {
      background-color: var(--surface-300);
    }
  }
}
</style>
