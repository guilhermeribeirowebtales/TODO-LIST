const jwt = require('jsonwebtoken');

/**
 * Decodes the JWT token from the Authorization header.
 * The token is issued by the external auth service, so we decode
 * (not verify with a local secret) to extract the user payload.
 * Returns the decoded payload or null if invalid/missing.
 */
function authenticateToken(token) {
  if (!token) return null;

  // Remove "Bearer " prefix if present
  const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;

  try {
    const decoded = jwt.decode(cleanToken);
    if (!decoded) return null;
    return decoded;
  } catch (error) {
    return null;
  }
}

module.exports = { authenticateToken };
