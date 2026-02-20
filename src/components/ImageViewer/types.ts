import type { TiledImageOptions } from 'openseadragon'
import type { Annotation } from '@iiif/presentation-3'

export interface ImageViewerProps {
  annotations: Annotation[],
  tileSources: TiledImageOptions[],
  annotationStyle?: AnnotationStyle
  hoveredAnnotationIds?: string[]
  activeAnnotationIds?: string[]
  showAnnotations?: boolean
  verbose?: boolean,
  rotation?: number,
  zoom?: number,
  center?: { x: number, y: number }
}

export interface AnnotationStyle {
  default?: BoxStyle
  hover?: BoxStyle
  active?: BoxStyle
  activeHover?: BoxStyle
}

export interface BoxStyle {
  backgroundColor?: string // colour or gradient function
  opacity?: number
  borderColor?: string
  borderWidth?: string | number
  borderStyle?: string // 'solid' only
  outlineColor?: string
  outlineWidth?: string | number
  outlineOffset?: string | number
  outlineStyle?: string // 'solid' only

  // Parsed.
  boxShadow?: string
  border?: string // 'solid' only
  outline?: string // 'solid' only
  background?: string // Alias for `backgroundColor:`
}
