<template>
  <div class="panel__layers">
    <div v-for="(layer, index) in layers" :key="layer.id" class="layer flex py-2 border-b border-gray-200">
      <div class="layer_image">
        <img :src="layer.thumbnail" class="h-12" :alt="layer.label" :title="layer.label">
      </div>
      <div class="layer_content px-2 flex-1">
        <div class="flex gap-2 items-center">
          <Label class="flex-1">{{ layer.label }}</Label>
          <ToggleIcon
            v-model="layer.enabled"
            onIcon="pi pi-eye"
            offIcon="pi pi-eye-slash"
            title="Toggle layer visibility"
          ></ToggleIcon>
        </div>
        <div class="p-2 mt-2">
          <Slider
            v-model="layers[index].opacity"
            :min="0"
            :max="1"
            :step="0.01"
            class="_w-[4rem] w-full"
            v-if="layer.enabled"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useVault } from '@/lib/useVault.ts'
import type { Layer } from '@/components/ManifestViewer/types'

import Slider from 'primevue/slider'
import Label from '@/components/ManifestViewer/ui/Label.vue'
import ToggleIcon from '@/components/helpers/ToggleIcon.vue'

const vault = useVault()

const layers = defineModel<Layer[]>({
  default: []
})

const emit = defineEmits(['update'])

</script>

<style scoped></style>
