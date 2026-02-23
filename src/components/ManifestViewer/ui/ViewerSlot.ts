import { inject, defineComponent } from 'vue'

export default defineComponent({
  name: 'ViewerSlot',
  props: {
    name:      { type: String, required: true },
    slotProps: { type: Object, default: () => ({}) }
  },
  setup(props) {
    const viewerSlots = inject<Record<string, (scope: any) => any>>(
      'manifestViewerSlots', {}
    )
    return () => viewerSlots[props.name]?.(props.slotProps) ?? null
  }
})
