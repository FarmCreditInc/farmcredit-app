// JWT secret for authentication
export const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-for-development-only"

// Add other auth constants here as needed
export const TOKEN_EXPIRY = "7d" // Token expiry time (7 days)
