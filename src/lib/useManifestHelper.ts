import { getLocalizedValue, getLocalizedValues } from '@/lib/LocalizationHelper'

import type { Vault } from '@iiif/helpers/vault'

export type LocalizedMetadataEntry = {
    label: string;
    value: Array<string>;
}

export type LocalizedMetadata = LocalizedMetadataEntry[]


export const useManifestHelper = (vault: Vault) => {

    const getCanvasIds = (manifestId: string): string[] => {
        const manifest = vault.getObject(manifestId)
        if (!manifest || !('items' in manifest) || !manifest.items) return []
        return manifest.items.map((item: { id: any }) => item.id)
    }

    const getLocalizedMetadata = (metadata: any, language: string): LocalizedMetadata => {
        const result: LocalizedMetadata = []
        if (!metadata) return result
        for (const entry of metadata) {
            const label = getLocalizedValue(entry['label'], language)
            const value = getLocalizedValues(entry['value'], language)
            if (label && value) {
                result.push({ label, value })
            }
        }
        return result
    }

    return {
        getCanvasIds,
        getLocalizedMetadata
    }

}