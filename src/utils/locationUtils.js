import nigeriaStatesLgas from '../data/nigeria-states-lgas.json'

/**
 * Generate LGA acronym based on the following rules:
 * - One word: First 3 letters (max 3 letters)
 * - Two words: First 2 letters of first word + first letter of second word
 * - Three or more words: First letter from each word (max 3 letters total)
 * 
 * @param {string} lgaName - The LGA name
 * @returns {string} - The generated acronym (max 3 letters, uppercase)
 */
export const generateLgaAcronym = (lgaName) => {
    if (!lgaName || lgaName.trim() === '') return ''

    const words = lgaName.trim().split(/\s+/)
    let acronym = ''

    if (words.length === 1) {
        // Single word: take first 3 letters
        acronym = words[0].substring(0, 3)
    } else if (words.length === 2) {
        // Two words: First 2 letters of first word + first letter of second word
        acronym = words[0].substring(0, 2) + words[1].substring(0, 1)
    } else {
        // Three or more words: First letter from each word (max 3 letters)
        acronym = words.slice(0, 3).map(word => word.substring(0, 1)).join('')
    }

    return acronym.toUpperCase()
}

/**
 * Get all Nigerian states
 * @returns {string[]} - Array of state names
 */
export const getNigerianStates = () => {
    return nigeriaStatesLgas.map(item => item.state).sort()
}

/**
 * Get LGAs for a specific Nigerian state
 * @param {string} stateName - The state name
 * @returns {string[]} - Array of LGA names for the state
 */
export const getLgasForState = (stateName) => {
    const stateData = nigeriaStatesLgas.find(item => item.state === stateName)
    return stateData ? stateData.lgas.sort() : []
}

/**
 * Verify if an LGA exists for a given state
 * @param {string} stateName - The state name
 * @param {string} lgaName - The LGA name
 * @returns {boolean} - True if the LGA exists for the state
 */
export const verifyLgaForState = (stateName, lgaName) => {
    const lgas = getLgasForState(stateName)
    return lgas.includes(lgaName)
}

/**
 * Get all countries (Nigeria and Diaspora)
 * @returns {string[]} - Array of country options
 */
export const getCountryOptions = () => {
    return ['Nigeria', 'Diaspora']
}
