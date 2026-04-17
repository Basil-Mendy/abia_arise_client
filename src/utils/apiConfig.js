/**
 * API Configuration Helper
 * Provides the correct API base URL based on environment
 */

export const getAPIBaseURL = () => {
    // In production (Vercel), use Railway backend URL
    if (import.meta.env.PROD) {
        return import.meta.env.VITE_API_BASE_URL || 'https://abiaariseserver-production.up.railway.app/api'
    }

    // In development, use localhost
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
}

export const getFullURL = (path) => {
    const baseURL = getAPIBaseURL()
    if (path.startsWith('http')) {
        return path
    }
    return `${baseURL}${path}`
}

// For file URLs (images, documents)
export const getFileURL = (filePath) => {
    if (!filePath) return null
    if (filePath.startsWith('http')) {
        return filePath
    }
    const baseURL = getAPIBaseURL().replace('/api', '')
    return `${baseURL}${filePath}`
}
