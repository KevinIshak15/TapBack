/**
 * Google Business Profile integration: status, start, callback, disconnect, locations.
 */

import type { Express } from "express";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import { storage } from "../storage";
import { buildAuthUrl, exchangeCodeForTokens } from "../integrations/googleOAuth";
import { storeTokensFromCallback } from "../integrations/googleTokenService";
import { listAllLocations } from "../integrations/googleGbpClient";
import { randomBytes } from "crypto";

export function registerIntegrationRoutes(app: Express) {
  // GET /api/integrations/google/status
  app.get(
    "/api/integrations/google/status",
    requireAuth,
    asyncHandler(async (req, res) => {
      const userId = req.user!.id;
      const integration = await storage.getGoogleIntegration(userId);
      if (!integration) {
        return res.json({ status: "disconnected", connectedEmail: null });
      }
      if (integration.status === "needs_reauth") {
        return res.json({ status: "needs_reauth", connectedEmail: integration.connectedEmail ?? null });
      }
      return res.json({
        status: "active",
        connectedEmail: integration.connectedEmail ?? null,
      });
    })
  );

  // GET /api/integrations/google/start
  app.get(
    "/api/integrations/google/start",
    requireAuth,
    asyncHandler(async (req, res) => {
      const userId = req.user!.id;
      const state = randomBytes(24).toString("hex");
      (req.session as any).googleIntegrationState = state;
      (req.session as any).googleIntegrationReturnUserId = userId;
      const url = buildAuthUrl(state, true);
      res.redirect(url);
    })
  );

  // GET /api/integrations/google/callback
  app.get(
    "/api/integrations/google/callback",
    asyncHandler(async (req, res) => {
      const { code, state, error } = req.query as { code?: string; state?: string; error?: string };
      if (error) {
        const front = process.env.VITE_APP_ORIGIN || process.env.BASE_URL || "http://localhost:5000";
        return res.redirect(`${front}/business/new?google_error=${encodeURIComponent(String(error))}`);
      }
      const sessionState = (req.session as any)?.googleIntegrationState;
      if (!state || state !== sessionState) {
        return res.redirect((process.env.VITE_APP_ORIGIN || process.env.BASE_URL || "http://localhost:5000") + "/business/new?google_error=invalid_state");
      }
      const userId = (req.session as any)?.googleIntegrationReturnUserId;
      if (!userId || !code) {
        return res.redirect((process.env.VITE_APP_ORIGIN || process.env.BASE_URL || "http://localhost:5000") + "/business/new?google_error=missing");
      }
      (req.session as any).googleIntegrationState = undefined;
      (req.session as any).googleIntegrationReturnUserId = undefined;

      const front = process.env.VITE_APP_ORIGIN || process.env.BASE_URL || "http://localhost:5000";
      try {
        const tokens = await exchangeCodeForTokens(code);
        const connectedEmail = undefined;
        await storeTokensFromCallback(
          userId,
          tokens.access_token,
          tokens.expires_in ?? 3600,
          tokens.refresh_token,
          connectedEmail
        );
        return res.redirect(`${front}/business/new?google_connected=1`);
      } catch (err: any) {
        const msg = err?.message?.slice(0, 100) || "token_exchange_failed";
        return res.redirect(`${front}/business/new?google_error=${encodeURIComponent(msg)}`);
      }
    })
  );

  // POST /api/integrations/google/disconnect
  app.post(
    "/api/integrations/google/disconnect",
    requireAuth,
    asyncHandler(async (req, res) => {
      await storage.disconnectGoogle(req.user!.id);
      res.json({ ok: true });
    })
  );

  // GET /api/integrations/google/locations
  app.get(
    "/api/integrations/google/locations",
    requireAuth,
    asyncHandler(async (req, res) => {
      const userId = req.user!.id;
      const integration = await storage.getGoogleIntegration(userId);
      if (!integration || integration.status !== "active") {
        return res.status(400).json({
          code: "INTEGRATION_NOT_ACTIVE",
          message: "Google Business Profile is not connected or needs reconnection.",
        });
      }
      let listError: string | undefined;
      let activationUrl: string | undefined;
      let all: { accountName: string; location: import("../integrations/googleGbpClient").GbpLocation }[];
      try {
        const result = await listAllLocations(userId);
        all = result.locations;
        listError = result.error;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        const urlMatch = msg.match(/"activationUrl"\s*:\s*"([^"]+)"/);
        activationUrl = urlMatch ? urlMatch[1] : undefined;
        const isQuota = msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("Quota exceeded") || msg.includes("quota_limit_value");
        if (msg.includes("SERVICE_DISABLED") || msg.includes("has not been used")) {
          listError = "My Business Account Management API is not enabled for your Google Cloud project. Enable it in the link below.";
        } else if (isQuota) {
          listError = "Google has not granted API quota for this project yet (0 requests allowed). You need to request access to the Google Business Profile API.";
          activationUrl = "https://developers.google.com/my-business/content/prereqs#request-access";
        } else {
          listError = msg;
        }
        all = [];
      }
      const locations = all.map(({ accountName, location }) => ({
        locationResourceName: location.name,
        accountName,
        locationName: location.title || location.locationName || location.name?.split("/").pop() || "Unnamed",
        storeAddress: location.storeAddress || location.address?.formattedAddress,
      }));
      res.json({ locations, error: listError, activationUrl });
    })
  );

  // POST /api/integrations/google/locations/select
  app.post(
    "/api/integrations/google/locations/select",
    requireAuth,
    asyncHandler(async (req, res) => {
      const userId = req.user!.id;
      const body = req.body as { locationResourceNames?: string[]; locations?: { locationResourceName: string; accountName?: string; locationName?: string; storeAddress?: string }[] };
      let toSave: { locationResourceName: string; accountName?: string; locationName?: string; storeAddress?: string }[];
      if (Array.isArray(body.locations) && body.locations.length > 0) {
        toSave = body.locations.map((l) => ({
          locationResourceName: l.locationResourceName,
          accountName: l.accountName,
          locationName: l.locationName,
          storeAddress: l.storeAddress,
        }));
      } else if (Array.isArray(body.locationResourceNames) && body.locationResourceNames.length > 0) {
        toSave = body.locationResourceNames.map((name) => ({ locationResourceName: name }));
      } else {
        return res.status(400).json({ message: "Provide locationResourceNames or locations array" });
      }

      const integration = await storage.getGoogleIntegration(userId);
      if (!integration || integration.status !== "active") {
        return res.status(400).json({
          code: "INTEGRATION_NOT_ACTIVE",
          message: "Google Business Profile is not connected.",
        });
      }

      const existing = await storage.getLocationLinksByUser(userId);
      const alreadyAdded: string[] = [];
      for (const loc of toSave) {
        const link = existing.find((l) => l.locationResourceName === loc.locationResourceName && l.businessId != null);
        if (link) alreadyAdded.push(loc.locationResourceName);
      }
      if (alreadyAdded.length > 0) {
        return res.status(400).json({
          code: "LOCATION_ALREADY_ADDED",
          message: "This location is already added.",
          alreadyAdded,
        });
      }

      const saved = await storage.saveSelectedLocationLinks(userId, toSave);
      res.json({ selected: saved });
    })
  );
}
