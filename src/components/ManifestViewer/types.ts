export interface ManifestViewerProps {
  verbose: boolean,
  manifestId: string,
  viewerStateId?: string
}

export interface ViewerPanel {
  id: string
  label: string
  icon: string
  component: any
  visible: boolean
  enabled: boolean
  storeId?: string
  panelWeight: number
  iconWeight: number
  width?: number // (pixels)
  minWidth?: number // (pixels)
  maxWidth?: number // (pixels)
}

export interface Layer {
  id: string
  opacity: number
  enabled: boolean
  label?: string
  thumbnail?: string
}

export interface ViewerPanelState {
  id: string,
  enabled: boolean
  visible: boolean
  optionsVisible: boolean
}

export type ViewerPanelStateList = Array<ViewerPanelState>

export interface ImageControlsScope {
  zoomIn: () => void
  zoomOut: () => void
  goHome: () => void
  rotateLeft: () => void
  rotateRight: () => void
  osd: any
}

export type ManifestViewerSlots = {
  'image-controls-bottom'?: (scope: ImageControlsScope) => any
  'image-controls-top'?: (scope: ImageControlsScope) => any
}