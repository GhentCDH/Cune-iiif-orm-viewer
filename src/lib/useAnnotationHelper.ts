import {Vault, expandTarget} from "@iiif/helpers";
import type {AnnotationPage} from "@iiif/presentation-3";
import type {AnnotationNormalized} from "@iiif/presentation-3-normalized";
import { ensureArray } from '@/lib/ArrayHelper.ts'

export const useAnnotationHelper = (vault: Vault) => {

    const getCanvasAnnotations = async (canvasId: string)  => {
        const annotations: AnnotationNormalized[] = []

        const canvas = vault.getObject(canvasId)
        if (!canvas) return annotations

        if ('annotations' in canvas && canvas.annotations) {
            for (const annotationPageRef of canvas.annotations) {
                // ensure annotation page is loaded
                // await vault.ensureLoaded(annotationPageRef)

                // walk annotations
                const annotationPage = await vault.loadObject<AnnotationPage>(annotationPageRef.id)
                if (annotationPage && 'items' in annotationPage) {
                    for (const annotationRef of annotationPage.items) {
                        const annotationNormalized = vault.getObject(annotationRef)
                        const targets = ensureArray(annotationNormalized.target)
                        const matchingTargets = getMatchingTargets(canvasId, targets)
                        if (matchingTargets.length === 0) {
                            console.warn(`Annotation ${annotationRef.id} does not target canvas ${canvasId}, skipping.`)
                            continue
                        }
                        // add annotation id to list
                        annotations.push(annotationNormalized)
                    }
                }
            }
        }
        return annotations
    }

    const isTargetMatchingSource = (sourceId: string, target: string | string[] ) => {
        const targets = ensureArray(target)
        for (const t of targets) {
            const expandedTarget = expandTarget(t)
            if (typeof expandedTarget.source === 'string' && expandedTarget.source === sourceId) {
                return true
            }
            if (typeof expandedTarget.source === 'object' && 'id' in expandedTarget.source && expandedTarget.source.id === sourceId) {
                return true
            }
        }
    }

    const getMatchingTargets = (sourceId: string, targets: Array<any>): Array<any> => {
        const matchingTargets = []
        for (const target of targets) {
            if (isTargetMatchingSource(sourceId, target)) {
                matchingTargets.push(target)
            }
        }
        return matchingTargets
    }

    return {
        getCanvasAnnotations,
        isTargetMatchingSource,
        getMatchingTargets,
    }


}

