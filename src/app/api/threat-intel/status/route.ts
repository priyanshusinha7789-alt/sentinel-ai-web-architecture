import { NextResponse } from "next/server";
import { ThreatIntelService } from "@/lib/threat-intel/service";

/**
 * GET /api/threat-intel/status
 * Returns provider readiness and capability metadata without exposing secrets.
 */
export async function GET() {
  const service = ThreatIntelService.getInstance();
  const capabilities = service.getCapabilities();

  return NextResponse.json({
    status: "ok",
    provider: capabilities.name,
    version: capabilities.version,
    isConfigured: capabilities.isConfigured,
    requiresConsent: capabilities.requiresConsent,
    rateLimitNote: capabilities.rateLimitNote,
    supportedSchemes: capabilities.supportedSchemes,
    timestamp: new Date().toISOString(),
  });
}
