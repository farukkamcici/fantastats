import { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";

/**
 * Yahoo OAuth 2.0 Provider for NextAuth
 * 
 * Yahoo Fantasy Sports API requires OAuth 2.0 authentication.
 * 
 * IMPORTANT: Yahoo OAuth has quirks:
 * - Tokens expire in 1 hour (3600 seconds)
 * - Refresh tokens can become invalid if user revokes access
 * - Yahoo may return different error formats
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
    userId?: string;
  }
}

/**
 * Refresh Yahoo access token using refresh token
 * Yahoo's token endpoint requires Basic auth with client credentials
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
  console.log("[Auth] Attempting to refresh access token...");
  
  if (!token.refreshToken) {
    console.error("[Auth] No refresh token available");
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }

  try {
    const clientId = process.env.YAHOO_CLIENT_ID;
    const clientSecret = process.env.YAHOO_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      throw new Error("Missing Yahoo OAuth credentials");
    }

    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    
    const response = await fetch("https://api.login.yahoo.com/oauth2/get_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });

    const responseText = await response.text();
    let refreshedTokens: any;
    
    try {
      refreshedTokens = JSON.parse(responseText);
    } catch {
      console.error("[Auth] Failed to parse refresh response:", responseText);
      throw new Error("Invalid response from Yahoo token endpoint");
    }

    if (!response.ok) {
      console.error("[Auth] Token refresh failed:", refreshedTokens);
      // Yahoo returns error in different formats
      const errorMsg = refreshedTokens.error_description || refreshedTokens.error || "Token refresh failed";
      throw new Error(errorMsg);
    }

    console.log("[Auth] Token refreshed successfully");
    
    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + (refreshedTokens.expires_in || 3600) * 1000,
      // Yahoo may or may not return a new refresh token
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
      error: undefined, // Clear any previous errors
    };
  } catch (error) {
    console.error("[Auth] Error refreshing access token:", error);
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
      
      // Authorization endpoint - where users are sent to login
      authorization: {
        url: "https://api.login.yahoo.com/oauth2/request_auth",
        params: {
          scope: "openid fspt-r",
          response_type: "code",
        },
      },
      
      // Token endpoint - exchange code for tokens
      token: {
        url: "https://api.login.yahoo.com/oauth2/get_token",
        async request({ params, provider }) {
          console.log("[Auth] Exchanging code for tokens...");
          
          const clientId = process.env.YAHOO_CLIENT_ID;
          const clientSecret = process.env.YAHOO_CLIENT_SECRET;
          
          if (!clientId || !clientSecret) {
            throw new Error("Missing Yahoo OAuth credentials");
          }

          const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
          
          const response = await fetch("https://api.login.yahoo.com/oauth2/get_token", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Basic ${basicAuth}`,
            },
            body: new URLSearchParams({
              grant_type: "authorization_code",
              code: params.code || "",
              redirect_uri: provider.callbackUrl,
            }),
          });

          const responseText = await response.text();
          let tokens: any;
          
          try {
            tokens = JSON.parse(responseText);
          } catch {
            console.error("[Auth] Failed to parse token response:", responseText);
            throw new Error("Invalid response from Yahoo");
          }

          if (!response.ok) {
            console.error("[Auth] Token exchange failed:", tokens);
            throw new Error(tokens.error_description || tokens.error || "Token exchange failed");
          }

          console.log("[Auth] Token exchange successful");
          return { tokens };
        },
      },
      
      // Userinfo endpoint - get user profile
      userinfo: {
        url: "https://api.login.yahoo.com/openid/v1/userinfo",
        async request({ tokens }) {
          console.log("[Auth] Fetching user info...");
          
          const response = await fetch("https://api.login.yahoo.com/openid/v1/userinfo", {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
            },
          });

          if (!response.ok) {
            console.error("[Auth] Failed to fetch user info:", response.status);
            // Return minimal user info if userinfo fails
            return { sub: "unknown", name: "Yahoo User" };
          }

          const userinfo = await response.json();
          console.log("[Auth] User info retrieved");
          return userinfo;
        },
      },
      
      clientId: process.env.YAHOO_CLIENT_ID,
      clientSecret: process.env.YAHOO_CLIENT_SECRET,
      
      // Map Yahoo profile to NextAuth user
      profile(profile) {
        return {
          id: profile.sub || profile.guid || "unknown",
          name: profile.name || profile.nickname || profile.given_name || "Yahoo User",
          email: profile.email || null,
          image: profile.picture || null,
        };
      },
    },
  ],
  
  callbacks: {
    // JWT callback - handle token storage and refresh
    async jwt({ token, account, user }) {
      // Initial sign in - store tokens
      if (account && user) {
        console.log("[Auth] Initial sign-in, storing tokens");
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at
            ? account.expires_at * 1000
            : Date.now() + 3600 * 1000, // Default 1 hour
          userId: user.id,
          error: undefined,
        };
      }

      // Return token if not expired (with 5 min buffer)
      const bufferMs = 5 * 60 * 1000;
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires - bufferMs) {
        return token;
      }

      // Token expired or expiring soon - refresh it
      console.log("[Auth] Token expired or expiring, refreshing...");
      return refreshAccessToken(token);
    },
    
    // Session callback - expose tokens to client
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.error = token.error;
      
      if (token.userId) {
        session.user.id = token.userId;
      }
      
      return session;
    },
    
    // SignIn callback - always allow Yahoo sign-ins
    async signIn({ account, profile }) {
      if (account?.provider === "yahoo") {
        console.log("[Auth] Yahoo sign-in attempt for:", profile?.email || "unknown");
        return true;
      }
      return true;
    },
    
    // Redirect callback - handle post-auth redirects
    async redirect({ url, baseUrl }) {
      // If the URL starts with base URL, allow it
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // If relative URL, append to baseUrl
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Default to baseUrl
      return baseUrl;
    },
  },
  
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  // Enable debug in development
  debug: process.env.NODE_ENV === "development",
  
  // Ensure cookies work in development
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" 
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};
