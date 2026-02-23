<script setup lang="ts">
import { ref, onMounted } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

// import child components
import { ManifestViewer } from '../src/index'
import Menubar from 'primevue/menubar'

const verbose = ref(false)
const manifestId = ref<string | null>(null)
const inputManifestId = ref('')

const menuBarItems = ref([])

// Example manifest URLs
const exampleManifests = [
  'https://iiif.ghentcdh.ugent.be/iiif/manifests/cune-iiif-orm:sde:O.0219/manifest.json',
  'https://iiif.ghentcdh.ugent.be/iiif/manifests/cune-iiif-orm:sde:O.0220/manifest.json',
  'https://iiif.ghentcdh.ugent.be/iiif/manifests/cune-iiif-orm:sde:O.0221/manifest.json',
  'https://iiif.ghentcdh.ugent.be/iiif/manifests/cune-iiif-orm:sde:BTT13/manifest.json'
]

// Read manifestId from URL parameter on mount
onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const urlManifestId = urlParams.get('iiif-content')

  if (urlManifestId) {
    manifestId.value = urlManifestId
  }
})

// Handle form submission
const loadManifest = () => {
  if (inputManifestId.value.trim()) {
    manifestId.value = inputManifestId.value.trim()

    // Update URL without page reload
    const url = new URL(window.location.href)
    url.searchParams.set('iiif-content', manifestId.value)
    window.history.pushState({}, '', url)
  }
}

// Load a specific manifest URL
const loadManifestUrl = (url: string) => {
  manifestId.value = url

  // Update URL without page reload
  const newUrl = new URL(window.location.href)
  newUrl.searchParams.set('iiif-content', url)
  window.history.pushState({}, '', newUrl)
}

// Handle reset/change manifest
const resetManifest = () => {
  manifestId.value = null
  inputManifestId.value = ''

  // Remove URL parameter
  const url = new URL(window.location.href)
  url.searchParams.delete('iiif-content')
  window.history.pushState({}, '', url)
}
</script>

<template>
  <section class="w-full h-full flex flex-col">
    <!-- Show form when no manifestId is loaded -->
    <div v-if="!manifestId" class="flex-1 flex items-center justify-center bg-gray-50">
      <div class="w-full max-w-2xl p-8 bg-white rounded-lg shadow-lg">
        <h1 class="text-2xl font-bold mb-2 text-gray-800">Cune-iiif-orm IIIF Manifest Viewer</h1>
        <p class="text-gray-600 mb-6">
          Enter a Cune-iiif-orm IIIF Manifest URL to view the content
        </p>

        <form @submit.prevent="loadManifest" class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <label for="manifestUrl" class="text-sm font-medium text-gray-700">
              IIIF Manifest URL
            </label>
            <InputText
              id="manifestUrl"
              v-model="inputManifestId"
              type="url"
              placeholder="https://example.com/iiif/manifest.json"
              required
              class="w-full"
            />
          </div>

          <Button
            type="submit"
            label="Load Manifest"
            icon="pi pi-eye"
            :disabled="!inputManifestId.trim()"
          />
        </form>

        <div class="mt-6 p-4 rounded border border-blue-200">
          <p class="text-sm text-blue-800 font-medium mb-3">Examples:</p>
          <ul class="space-y-2">
            <li
              v-for="(url, index) in exampleManifests"
              :key="index"
              class="flex items-start gap-2"
            >
              <Button
                icon="pi pi-eye"
                size="small"
                @click="loadManifestUrl(url)"
                class="flex-shrink-0"
                aria-label="Load this manifest"
              />
              <span class="text-sm text-blue-700 break-all self-center">{{ url }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Show viewer when manifestId is loaded -->
    <template v-else>
      <Menubar :model="menuBarItems" class="bg-green-700">
        <template #start>
          <h3>Cune-iiif-orm IIIF Viewer</h3>
        </template>
        <template #item="{ item, props }">
          <a class="flex items-center" v-bind="props.action">
            <span :class="item.icon" />
            <span class="ml-2">{{ item.label }}</span>
          </a>
        </template>
        <template #end>
          <Button
            icon="pi pi-times"
            label="Change Manifest"
            severity="secondary"
            size="small"
            class="absolute right-2 z-50"
            @click="resetManifest"
          />
        </template>
      </Menubar>
      <ManifestViewer
        :verbose="verbose"
        :manifest-id="manifestId"
        :viewer-state-id="undefined"
        class="flex-1"
        v-if="manifestId"
      >
      </ManifestViewer>
    </template>
  </section>
</template>
