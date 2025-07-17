import CryptoJS from 'crypto-js'
import Cookies from 'js-cookie'

// Storage utilities for OAuth state and PKCE parameters
export const OAuthStorage = {
	setItem: (key: string, value: string) => {
		let success = false

		// Try multiple storage methods
		try {
			// Method 1: Cookies with explicit settings
			Cookies.set(key, value, {
				expires: 1 / 24, // 1 hour
				secure: false, // Set to true in production with HTTPS
				sameSite: 'lax',
				path: '/'
			})
			success = true
			console.log(`✓ Stored ${key} in cookies`)
		} catch (error) {
			console.warn(`✗ Failed to store ${key} in cookies:`, error)
		}

		try {
			// Method 2: sessionStorage
			if (typeof window !== 'undefined' && window.sessionStorage) {
				window.sessionStorage.setItem(key, value)
				success = true
				console.log(`✓ Stored ${key} in sessionStorage`)
			}
		} catch (error) {
			console.warn(`✗ Failed to store ${key} in sessionStorage:`, error)
		}

		try {
			// Method 3: localStorage as last resort
			if (typeof window !== 'undefined' && window.localStorage) {
				window.localStorage.setItem(`oauth_temp_${key}`, value)
				success = true
				console.log(`✓ Stored ${key} in localStorage`)
			}
		} catch (error) {
			console.warn(`✗ Failed to store ${key} in localStorage:`, error)
		}

		if (!success) {
			console.error(`Failed to store ${key} in any storage method!`)
		}
	},

	getItem: (key: string): string | null => {
		let value = null

		try {
			// Try cookies first
			value = Cookies.get(key)
			if (value) {
				console.log(`✓ Retrieved ${key} from cookies`)
				return value
			}
		} catch (error) {
			console.warn(`✗ Failed to retrieve ${key} from cookies:`, error)
		}

		try {
			// Try sessionStorage
			if (typeof window !== 'undefined' && window.sessionStorage) {
				value = window.sessionStorage.getItem(key)
				if (value) {
					console.log(`✓ Retrieved ${key} from sessionStorage`)
					return value
				}
			}
		} catch (error) {
			console.warn(`✗ Failed to retrieve ${key} from sessionStorage:`, error)
		}

		try {
			// Try localStorage
			if (typeof window !== 'undefined' && window.localStorage) {
				value = window.localStorage.getItem(`oauth_temp_${key}`)
				if (value) {
					console.log(`✓ Retrieved ${key} from localStorage`)
					return value
				}
			}
		} catch (error) {
			console.warn(`✗ Failed to retrieve ${key} from localStorage:`, error)
		}

		console.warn(`✗ Could not retrieve ${key} from any storage method`)
		return null
	},

	removeItem: (key: string) => {
		try {
			Cookies.remove(key, { path: '/' })
			console.log(`✓ Removed ${key} from cookies`)
		} catch (error) {
			console.warn(`✗ Failed to remove ${key} from cookies:`, error)
		}

		try {
			if (typeof window !== 'undefined' && window.sessionStorage) {
				window.sessionStorage.removeItem(key)
				console.log(`✓ Removed ${key} from sessionStorage`)
			}
		} catch (error) {
			console.warn(`✗ Failed to remove ${key} from sessionStorage:`, error)
		}

		try {
			if (typeof window !== 'undefined' && window.localStorage) {
				window.localStorage.removeItem(`oauth_temp_${key}`)
				console.log(`✓ Removed ${key} from localStorage`)
			}
		} catch (error) {
			console.warn(`✗ Failed to remove ${key} from localStorage:`, error)
		}
	},

	// Debug function to check all storage methods
	debug: (key: string) => {
		const results = {
			cookies: null as string | null,
			sessionStorage: null as string | null,
			localStorage: null as string | null
		}

		try {
			results.cookies = Cookies.get(key) || null
		} catch (e) {
			results.cookies = 'ERROR'
		}

		try {
			if (typeof window !== 'undefined' && window.sessionStorage) {
				results.sessionStorage = window.sessionStorage.getItem(key)
			}
		} catch (e) {
			results.sessionStorage = 'ERROR'
		}

		try {
			if (typeof window !== 'undefined' && window.localStorage) {
				results.localStorage = window.localStorage.getItem(`oauth_temp_${key}`)
			}
		} catch (e) {
			results.localStorage = 'ERROR'
		}

		return results
	}
}

// Generate a cryptographically random string for PKCE code verifier
export function generateCodeVerifier(): string {
	const array = new Uint8Array(32)
	if (typeof window !== 'undefined' && window.crypto) {
		window.crypto.getRandomValues(array)
	} else {
		// Fallback for server-side
		for (let i = 0; i < array.length; i++) {
			array[i] = Math.floor(Math.random() * 256)
		}
	}
	return btoa(String.fromCharCode.apply(null, Array.from(array)))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=/g, '')
}

// Generate code challenge from verifier using SHA256
export function generateCodeChallenge(verifier: string): string {
	const hash = CryptoJS.SHA256(verifier)
	return hash.toString(CryptoJS.enc.Base64)
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=/g, '')
}

// Generate a random state parameter
export function generateState(): string {
	const array = new Uint8Array(16)
	if (typeof window !== 'undefined' && window.crypto) {
		window.crypto.getRandomValues(array)
	} else {
		// Fallback for server-side
		for (let i = 0; i < array.length; i++) {
			array[i] = Math.floor(Math.random() * 256)
		}
	}
	return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Build authorization URL
export function buildAuthorizationUrl({
	baseUrl,
	clientId,
	redirectUri,
	scope,
	state,
	codeChallenge,
}: {
	baseUrl: string
	clientId: string
	redirectUri: string
	scope: string
	state: string
	codeChallenge: string
}): string {
	const params = new URLSearchParams({
		response_type: 'code',
		client_id: clientId,
		redirect_uri: redirectUri,
		scope: scope,
		state: state,
		code_challenge: codeChallenge,
		code_challenge_method: 'S256',
	})

	return `${baseUrl}/oauth2/authorize?${params.toString()}`
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens({
	baseUrl,
	clientId,
	clientSecret,
	redirectUri,
	code,
	codeVerifier,
}: {
	baseUrl: string
	clientId: string
	clientSecret?: string
	redirectUri: string
	code: string
	codeVerifier: string
}) {
	const tokenEndpoint = `${baseUrl}/oauth2/token`

	const body = new URLSearchParams({
		grant_type: 'authorization_code',
		client_id: clientId,
		redirect_uri: redirectUri,
		code: code,
		code_verifier: codeVerifier,
	})

	if (clientSecret) {
		body.append('client_secret', clientSecret)
	}

	const response = await fetch(tokenEndpoint, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: body.toString(),
	})

	if (!response.ok) {
		const errorText = await response.text()
		throw new Error(`Token exchange failed: ${response.status} ${errorText}`)
	}

	return await response.json()
}

// Get user info using access token
export async function getUserInfo(baseUrl: string, accessToken: string) {
	const userInfoEndpoint = `${baseUrl}/oauth2/userinfo`

	const response = await fetch(userInfoEndpoint, {
		headers: {
			'Authorization': `Bearer ${accessToken}`,
		},
	})

	if (!response.ok) {
		const errorText = await response.text()
		throw new Error(`UserInfo request failed: ${response.status} ${errorText}`)
	}

	return await response.json()
}