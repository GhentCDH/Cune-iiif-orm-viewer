import { Vault } from '@iiif/helpers/vault'
import { markRaw } from 'vue'

// Singleton vault instance
const vault = markRaw(new Vault())

export const useVault = (): Vault => {
  return vault
}
