import {createPaintingAnnotationsHelper, Vault} from "@iiif/helpers";
import type { AnnotationBody } from '@iiif/presentation-3'
import { ensureArray } from '@/lib/ArrayHelper.ts'

export const useCanvasHelper = (vault: Vault) => {

    const { getPaintables, getAllPaintingAnnotations, extractChoices } = createPaintingAnnotationsHelper(vault)

    const getAllImages = (canvasId: string): string[] => {
      const paintables = getPaintables(canvasId)

      const imageResources = new Set<string>()

      // Extract image resources from choices if they exist
      if (paintables.choice) {
        if (paintables.choice.type === 'single-choice') {
          for (const choice of paintables.choice.items) {
            imageResources.add(choice.id)
          }
        }
      }

      // Walk through paintables and extract image resources
      for (const paintable of paintables.items) {
        if (!paintable.resource) continue
        if (paintable.type !== 'image') continue
        if (paintable.resource.id) {
          imageResources.add(paintable.resource.id)
        }
      }

      return Array.from(imageResources)
    }

    const getChoices = (canvasId: string) => {
        const paintables = getPaintables(canvasId)
        return paintables.choice ?? null
    }

    const hasChoices = (canvasId: string) => {
        const paintables = getPaintables(canvasId)
        return paintables.choice !== undefined
    }

    return {
        getChoices,
        hasChoices,
        getAllImages,
    }
}