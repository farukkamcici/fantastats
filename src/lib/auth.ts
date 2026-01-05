import { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";

/**
 * Yahoo OAuth Provider for NextAuth
 * 
 * Yahoo Fantasy Sports API requires OAuth 2.0 authentication.
 * This provider handles the auth flow and token management.
 * 
 * Scopes:
 * - openid: Required for authentication
 * - fspt-r: Read access to Fantasy Sports data
 */

// Extend NextAuth types for Yahoo tokens
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    error?: string;
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
  }
}

/**
 * Refresh Yahoo access token using refresh token
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const response = await fetch("https://api.login.yahoo.com/oauth2/get_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.YAHOO_CLIENT_ID}:${process.env.YAHOO_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refreshToken || "",
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: "yahoo",
      name: "Yahoo",
      type: "oauth",
      authorization: {
        url: "https://api.login.yahoo.com/oauth2/request_auth",
        params: {
          scope: "openid fspt-r",
          response_type: "code",
        },
      },
      token: {
        url: "https://api.login.yahoo.com/oauth2/get_token",
        async request({ client, params, checks, provider }) {
          const response = await fetch("https://api.login.yahoo.com/oauth2/get_token", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Basic ${Buffer.from(
                `${process.env.YAHOO_CLIENT_ID}:${process.env.YAHOO_CLIENT_SECRET}`
              ).toString("base64")}`,
            },
            body: new URLSearchParams({
              grant_type: "authorization_code",
              code: params.code || "",
              redirect_uri: provider.callbackUrl,
            }),
          });

          const tokens = await response.json();
          return { tokens };
        },
      },
      userinfo: {
        url: "https://api.login.yahoo.com/openid/v1/userinfo",
        async request({ tokens }) {
          const response = await fetch("https://api.login.yahoo.com/openid/v1/userinfo", {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
            },
          });
          return await response.json();
        },
      },
      clientId: process.env.YAHOO_CLIENT_ID,
      clientSecret: process.env.YAHOO_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name || profile.nickname,
          email: profile.email,
          image: profile.picture,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at
            ? account.expires_at * 1000
            : Date.now() + 3600 * 1000, // Default 1 hour
        };
      }

      // Return previous token if the access token has not expired yet
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Access token has expired, try to refresh it
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.error = token.error;
      return session;
    },
  },
  pages: {
    // Let NextAuth handle OAuth redirects naturally
    // After successful auth, user goes to callbackUrl specified in signIn()
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === "development",
};
