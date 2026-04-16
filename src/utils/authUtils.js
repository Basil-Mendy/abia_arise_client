/**
 * Auth Token Management Utility
 * Handles storing, retrieving, and formatting auth tokens safely
 */

// Get the raw token (without "Bearer " prefix)
export const getAuthToken = () => {
    let token = localStorage.getItem('authToken') || ''

    // Remove "Bearer " prefix if present (to avoid duplicates)
    if (token.startsWith('Bearer ')) {
        token = token.substring(7)
    }

    // Log for debugging
    console.log('🔐 Auth token retrieved:', {
        token: token ? token.substring(0, 20) + '...' : 'null',
        length: token.length,
        timestamp: new Date().toISOString()
    })

    return token
}

// Set the auth token (stores without "Bearer " prefix)
export const setAuthToken = (token) => {
    // Log what we're receiving
    console.log('🔐 setAuthToken called with:', {
        received: token,
        type: typeof token,
        isNull: token === null,
        isString: typeof token === 'string',
        isNullString: token === 'null'
    })

    // Validate token
    if (!token || token === 'null' || token === 'undefined' || token === '') {
        localStorage.removeItem('authToken')
        console.warn('⚠️ Invalid token received, clearing auth storage:', token)
        return
    }

    // Remove "Bearer " prefix if it's included
    let cleanToken = token
    if (typeof token === 'string' && token.startsWith('Bearer ')) {
        cleanToken = token.substring(7)
    }

    localStorage.setItem('authToken', cleanToken)
    console.log('✅ Auth token stored successfully:', {
        token: cleanToken.substring(0, 20) + '...',
        length: cleanToken.length,
        timestamp: new Date().toISOString()
    })
}

// Get formatted authorization header value
export const getAuthHeader = () => {
    const token = getAuthToken()
    return token ? `Bearer ${token}` : ''
}

// Clear auth token on logout
export const clearAuthToken = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    localStorage.removeItem('userType')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userPassword')
    console.log('🔐 All auth data cleared')
}

// Check if token exists and is not empty
export const hasAuthToken = () => {
    const token = getAuthToken()
    return token && token.length > 10 // JWT tokens are quite long
}

// Debug: Log all auth-related localStorage items
export const debugAuthStorage = () => {
    console.group('🔍 Auth Storage Debug Info')
    console.log('authToken:', localStorage.getItem('authToken') ? '✓ Set' : '✗ Missing')
    console.log('user:', localStorage.getItem('user') ? '✓ Set' : '✗ Missing')
    console.log('userType:', localStorage.getItem('userType'))
    console.log('userRole:', localStorage.getItem('userRole'))
    console.log('Full authToken:', localStorage.getItem('authToken')?.substring(0, 50) + '...')
    console.groupEnd()
}
