// Mock user database
export const MOCK_USERS = [
  { id: "1", username: "admin", password: "admin123" },
  { id: "2", username: "user", password: "user123" },
];

/**
 * Mock JWT token generator
 * In production, use a proper JWT library like jsonwebtoken
 */
export function generateMockJWT(userId: string, username: string): string {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const payload = {
    userId,
    username,
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
    iat: Math.floor(Date.now() / 1000),
  };

  // Mock encoding (NOT secure for production!)
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString(
    "base64url"
  );
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url"
  );
  const signature = Buffer.from("mock-signature").toString("base64url");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}
