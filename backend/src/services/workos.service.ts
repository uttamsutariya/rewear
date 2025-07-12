import { WorkOS } from "@workos-inc/node";
import { config } from "../config/env";
import { UnauthorizedError } from "../utils/errors";
import jwt, { JwtHeader } from "jsonwebtoken";
import jwksClient from "jwks-rsa";

// Initialize WorkOS client
const workos = new WorkOS(config.workos.apiKey);

// JWKS client for verifying JWT tokens
const jwks = jwksClient({
	jwksUri: `https://api.workos.com/sso/jwks/${config.workos.clientId}`,
	cache: true,
	rateLimit: true,
});

export interface WorkOSUser {
	sub: string; // WorkOS user ID
	email: string;
	firstName?: string;
	lastName?: string;
	emailVerified: boolean;
}

interface WorkOSTokenPayload {
	sub: string;
	email: string;
	first_name?: string;
	last_name?: string;
	email_verified?: boolean;
	aud: string;
	iss: string;
	iat: number;
	exp: number;
}

export class WorkOSService {
	/**
	 * Verify and decode a WorkOS JWT token
	 * @param token - The JWT token from the Authorization header
	 * @returns The decoded user information
	 */
	static async verifyToken(token: string): Promise<WorkOSUser> {
		try {
			// First decode the token to get the header
			const decoded = jwt.decode(token, { complete: true });
			if (!decoded || typeof decoded === "string") {
				throw new UnauthorizedError("Invalid token format");
			}

			// Get the signing key from JWKS
			const getKey = (header: JwtHeader, callback: jwt.SigningKeyCallback) => {
				jwks.getSigningKey(header.kid, (err: Error | null, key: jwksClient.SigningKey | undefined) => {
					if (err) {
						return callback(err);
					}
					const signingKey = key?.getPublicKey();
					callback(null, signingKey);
				});
			};

			// Verify the token
			return new Promise((resolve, reject) => {
				jwt.verify(
					token,
					getKey,
					{
						algorithms: ["RS256"],
						issuer: "https://api.workos.com/",
						audience: config.workos.clientId,
					},
					(err, decoded) => {
						if (err || !decoded || typeof decoded === "string") {
							reject(new UnauthorizedError("Invalid or expired token"));
							return;
						}

						const tokenPayload = decoded as WorkOSTokenPayload;
						resolve({
							sub: tokenPayload.sub,
							email: tokenPayload.email,
							firstName: tokenPayload.first_name,
							lastName: tokenPayload.last_name,
							emailVerified: tokenPayload.email_verified || false,
						});
					},
				);
			});
		} catch (error) {
			console.error("WorkOS token verification failed:", error);
			throw new UnauthorizedError("Invalid or expired token");
		}
	}

	/**
	 * Use WorkOS User Management API to get user by ID
	 * @param userId - The WorkOS user ID
	 * @returns The user profile
	 */
	static async getUser(userId: string) {
		try {
			const user = await workos.userManagement.getUser(userId);
			return user;
		} catch (error) {
			console.error("Failed to fetch WorkOS user:", error);
			throw new UnauthorizedError("Failed to fetch user information");
		}
	}
}
