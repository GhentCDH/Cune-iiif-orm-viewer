<template>
  <div class="panel__layers">
    <div v-for="(layer, index) in layers" :key="layer.id" class="layer flex py-2 border-b">
      <div class="layer_image">
        <img :src="layer.thumbnail" class="h-12" />
      </div>
      <div class="layer_content px-2 flex-1">
        <div class="flex gap-2 items-center">
          <Label class="flex-1">{{ layer.label }}</Label>
          <ToggleIcon
            v-model="layer.enabled"
            onIcon="pi pi-eye"
            offIcon="pi pi-eye-slash"
            offLabel=""
            onLabel=""
            class=""
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

import Slider from 'primevue/slider'
import Label from '@/components/ManifestViewer/ui/Label.vue'
import ToggleIcon from '@/components/helpers/ToggleIcon.vue'

const vault = useVault()

const layers = defineModel({
  type: Array,
  default: []
})

const emit = defineEmits(['update'])

</script>

<style scoped></style>
