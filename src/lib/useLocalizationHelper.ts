import { getClosestLanguage } from '@iiif/helpers'
import { ensureArray } from '@/lib/ArrayHelper.ts'

export const useLocalizationHelper = () => {

  const getLocalizedValues = (localizedStrings: { [key: string]: string | string[] } | undefined, language: string, fallback?: string): string[] | undefined => {
    if (!localizedStrings) {
      return undefined;
    }

    const lang = getClosestLanguage(language, Object.keys(localizedStrings))
    if (!lang) {
      return undefined;
    }
    return localizedStrings?.[lang] ? ensureArray(localizedStrings[lang]) : [fallback]
  }

  const getFirstLocalizedValue = (localizedStrings: { [key: string]: string } | undefined, language: string, fallback?: string): string | undefined => {
    const values = getLocalizedValues(localizedStrings, language, fallback)
    if (!values || values.length === 0) {
      return undefined;
    }
    return values[0];
  }

  return {
    getLocalizedValues,
    getFirstLocalizedValue
  }
}
