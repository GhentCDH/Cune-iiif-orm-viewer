import {createPaintingAnnotationsHelper, Vault} from "@iiif/helpers";

export const useCanvasHelper = (vault: Vault) => {

    const { getPaintables, getAllPaintingAnnotations, extractChoices } = createPaintingAnnotationsHelper(vault)

    const getAllImages = (canvasId: string): string[] => {
        const paintables = getPaintables(canvasId)

        const imageResources: string[] = []

        for (const { annotation} of paintables.items) {
            const body = annotation.body ? Array.isArray(annotation.body) ? annotation.body : [annotation.body] : []
            for (const b of body) {
                const bodyObject = vault.getObject(body)[0]
                if (bodyObject.type === 'Image') {
                    imageResources.push(bodyObject.id)
                }
            }
        }

        if (paintables.choice) {
            if (paintables.choice.type === 'single-choice') {
                for (const choice of paintables.choice.items) {
                    imageResources.push(choice.id)
                }
            }
        }

        return imageResources
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