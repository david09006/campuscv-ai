import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import dotenv from "dotenv";
import { searchExternalJobs, generateCVContent, getImprovementSuggestions } from "./server/gemini";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory store for LinkedIn OAuth CSRF state tokens: state -> expiry timestamp.
// One-time use, short TTL; acceptable for this app's scale (no external session store).
const pendingOAuthStates = new Map<string, number>();
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

function createOAuthState(): string {
  const now = Date.now();
  for (const [key, expiry] of pendingOAuthStates) {
    if (expiry < now) pendingOAuthStates.delete(key);
  }
  const state = crypto.randomBytes(32).toString("hex");
  pendingOAuthStates.set(state, now + OAUTH_STATE_TTL_MS);
  return state;
}

function consumeOAuthState(state: unknown): boolean {
  if (typeof state !== "string" || !state) return false;
  const expiry = pendingOAuthStates.get(state);
  pendingOAuthStates.delete(state);
  return expiry !== undefined && Date.now() < expiry;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/jobs/search", async (req, res) => {
    const { query, language } = req.body ?? {};
    if (typeof query !== "string" || !query.trim()) {
      return res.status(400).json({ error: "query is required" });
    }
    try {
      const jobs = await searchExternalJobs(query, typeof language === "string" ? language : "en");
      res.json(jobs);
    } catch (error) {
      console.error("Job search failed:", error);
      res.status(500).json({ error: "Failed to search jobs" });
    }
  });

  app.post("/api/cv/generate", async (req, res) => {
    const { data, language } = req.body ?? {};
    try {
      const content = await generateCVContent(data ?? {}, typeof language === "string" ? language : "en");
      res.json({ content });
    } catch (error) {
      console.error("CV generation failed:", error);
      res.status(500).json({ error: "Failed to generate CV content" });
    }
  });

  app.post("/api/cv/suggestions", async (req, res) => {
    const { section, content, language } = req.body ?? {};
    if (typeof section !== "string" || typeof content !== "string") {
      return res.status(400).json({ error: "section and content are required" });
    }
    try {
      const suggestions = await getImprovementSuggestions(section, content, typeof language === "string" ? language : "en");
      res.json({ suggestions });
    } catch (error) {
      console.error("Suggestions request failed:", error);
      res.status(500).json({ error: "Failed to get suggestions" });
    }
  });

  // LinkedIn OAuth Configuration
  const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
  const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;

  app.get("/api/auth/linkedin/url", (req, res) => {
    const redirectUri = `${process.env.APP_URL}/auth/linkedin/callback`;

    const params = new URLSearchParams({
      response_type: "code",
      client_id: LINKEDIN_CLIENT_ID || "",
      redirect_uri: redirectUri,
      state: createOAuthState(),
      scope: "openid profile email",
    });

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
    res.json({ url: authUrl });
  });

  app.get(["/auth/linkedin/callback", "/auth/linkedin/callback/"], async (req, res) => {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).send("Authorization code missing");
    }

    if (!consumeOAuthState(state)) {
      return res.status(400).send("Invalid or expired state parameter");
    }

    try {
      // Exchange code for access token
      const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code as string,
          redirect_uri: `${process.env.APP_URL}/auth/linkedin/callback`,
          client_id: LINKEDIN_CLIENT_ID || "",
          client_secret: LINKEDIN_CLIENT_SECRET || "",
        }),
      });

      const tokenData = await tokenResponse.json();
      
      if (!tokenResponse.ok) {
        console.error("LinkedIn token exchange failed:", tokenData);
        return res.status(500).send("Failed to exchange code for token");
      }

      // In a real app, you'd fetch user info and create a session
      // For this demo, we'll just send success back to the parent

      // The popup was only ever opened by this app, so its own origin is the only
      // valid postMessage target for a payload containing auth tokens.
      const targetOrigin = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;

      res.send(`
        <html>
          <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #f3f4f6;">
            <div style="background: white; padding: 2rem; rounded-xl; shadow-lg; text-align: center;">
              <h2 style="color: #2563eb;">Authentication Successful!</h2>
              <p>Closing window and returning to CampusCV AI...</p>
              <script>
                if (window.opener) {
                  window.opener.postMessage({
                    type: 'OAUTH_AUTH_SUCCESS',
                    provider: 'linkedin',
                    data: ${JSON.stringify(tokenData)}
                  }, ${JSON.stringify(targetOrigin)});
                  setTimeout(() => window.close(), 1000);
                } else {
                  window.location.href = '/';
                }
              </script>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("OAuth Callback Error:", error);
      res.status(500).send("Authentication failed");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
