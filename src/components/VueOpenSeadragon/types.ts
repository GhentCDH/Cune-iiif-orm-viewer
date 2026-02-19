import type { AnnotoriousOpts, DrawingStyleExpression, W3CImageAnnotation } from '@annotorious/openseadragon'
import { type Options as OpenSeadragonOptions, Point as OpenSeadragonPoint, type TiledImageOptions as OpenSeadragonTiledImageOptions } from 'openseadragon'

export interface VueOpenSeadragonProps {
  tileSources: OpenSeadragonTiledImageOptions[]
  annotations?: W3CImageAnnotation[]
  rotation?: number
  zoom?: number
  pan?: [number, number] | OpenSeadragonPoint
  showAnnotations?: boolean
  verbose?: boolean
  annotationStyle?: DrawingStyleExpression
  options?: OpenSeadragonOptions
  annotoriousOptions?: AnnotoriousOpts
}
