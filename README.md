# Cune-iiif-orm IIIF Viewer

This repository contains a Vue 3 based IIIF viewer for the Cune-iiif-orm project.


![img.png](img.png)

## Installation

```bash
pnpm add @ghentcdh/cune-iiif-orm-viewer
```

Import the required CSS in your entry file:

```js
import '@ghentcdh/cune-iiif-orm-viewer/style.css'
```

### Peer dependencies

| Package | Version |
|---------|---------|
| `vue` | `^3.0.0` |

---

## Usage

```vue
<script setup>
import { ManifestViewer } from '@ghentcdh/cune-iiif-orm-viewer'
</script>

<template>
  <ManifestViewer :manifest-id="manifestUrl" />
</template>
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `manifest-id` | `string` | required | IIIF manifest URL to load |
| `verbose` | `boolean` | `false` | Enable debug logging |
| `viewer-state-id` | `string` | `undefined` | Optional ID to scope/persist viewer state across instances |

---

## Slots

Slots receive their scope via Vue's provide/inject mechanism. Each slot is passed a scope object that exposes controls for the active image viewer. Use named slots with the `#slot-name="scope"` syntax to access these controls.

### Available slots

| Slot name | Scope | Position |
|-----------|-------|----------|
| `image-controls-bottom` | `ImageControlsScope` | Appended after zoom/rotation buttons (bottom-left overlay) |
| `image-controls-top` | `ImageControlsScope` | Appended after annotation toggle (top-left overlay) |

### `ImageControlsScope`

| Property | Type | Description |
|----------|------|-------------|
| `zoomIn` | `() => void` | Zoom in |
| `zoomOut` | `() => void` | Zoom out |
| `goHome` | `() => void` | Reset to home view |
| `rotateLeft` | `() => void` | Rotate counter-clockwise |
| `rotateRight` | `() => void` | Rotate clockwise |
| `osd` | `any` | Raw OpenSeadragon viewer instance |

### Example

```vue
<ManifestViewer :manifest-id="manifestUrl">
  <template #image-controls-bottom="{ goHome, osd }">
    <button @click="download(osd)">Download</button>
  </template>
  <template #image-controls-top>
    <MyCustomToggle />
  </template>
</ManifestViewer>
```

---

## TypeScript types

The following types are exported from the package:

```ts
import type {
  ManifestViewerProps,
  ManifestViewerSlots,
  ImageControlsScope,
} from '@ghentcdh/cune-iiif-orm-viewer'
```

## Credits

Development by [Ghent Centre for Digital Humanities - Ghent University](https://www.ghentcdh.ugent.be/). Funded by the [GhentCDH research projects](https://www.ghentcdh.ugent.be/projects).

<img src="https://www.ghentcdh.ugent.be/ghentcdh_logo_blue_text_transparent_bg_landscape.svg" alt="Landscape" width="500">
