import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useNamedEntityStore = defineStore('namedEntities', () => {

    const namedEntities = ref([])

    /* computed */
    
    /* methods */
    async function loadNamedEntities() {
        return fetch('./data/named_entities.json')
        .then((response) => response.text())
        .then((data) => {
          namedEntities.value = JSON.parse(data)
        })
    }

    return {
        namedEntities,
        loadNamedEntities
    }
});
