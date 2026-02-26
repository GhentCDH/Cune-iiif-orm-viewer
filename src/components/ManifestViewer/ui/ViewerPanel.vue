<script lang="ts">
export interface ViewerPanelProps {
  panelId: string
  title: string
  scrollable?: boolean
  viewerStateId?: string
}
</script>

<script setup lang="ts">
import Panel from 'primevue/panel'
import ScrollPanel from 'primevue/scrollpanel'
import Button from 'primevue/button'
import { toRefs } from 'vue'
import { useViewerState } from '@/stores/viewerState.ts'

// props
const props = withDefaults(defineProps<ViewerPanelProps>(), {
  scrollable: false,
})

const { scrollable } = toRefs(props)

// state
const viewerState = useViewerState(props.viewerStateId)

// scrollable container?
const container = scrollable.value ? ScrollPanel : 'div'

</script>

<template>
  <div class="viewer-panel border-0 w-full h-full">
    <component :is="container" class="w-full h-full">
      <Panel class="h-full border-none">
        <template #header>
          <span class="text-base font-semibold">{{ title }}</span>
        </template>
        <template #icons>
          <Button v-if="$slots.options" icon="pi pi-ellipsis-v" small text rounded size="small" @click="viewerState.togglePanelOptionsVisibility(panelId)"></Button>
          <Button icon="pi pi-times" small text rounded size="small" @click="viewerState.togglePanelVisibility(panelId)"></Button>
        </template>
        <template #footer></template>
        <div class="viewer-panel__options py-3" :class="{ active: viewerState.panels[panelId].optionsVisible  && $slots.options }">
          <slot name="options"></slot>
        </div>
        <div class="viewer-panel__content">
          <slot></slot>
        </div>
      </Panel>
    </component>
  </div>
</template>



<style>
@reference "tailwindcss";

.viewer-panel {
  .p-panel, .p-scrollpanel {
    @apply border-none;
  }

  .p-panel-header {
    @apply sticky top-0 items-baseline;
    background-color: var(--p-surface-0);
  }

  .viewer-panel__options {
    @apply hidden;

    &.active {
      @apply block;
    }
  }

  .p-panel-header-actions {
    @apply flex justify-end flex-wrap-reverse -mr-4;
  }
}
</style>