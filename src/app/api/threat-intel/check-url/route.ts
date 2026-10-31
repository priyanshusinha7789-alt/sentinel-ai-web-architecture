import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ThreatIntelService } from "@/lib/threat-intel/service";

const RequestSchema = z.object({
  url: z.string().min(1, "URL is required").max(2048, "URL exceeds maximum length of 2048 characters"),
  userConsent: z.boolean(),
  stripSensitiveTokens: z.boolean().optional(),
});

/**
 * POST /api/threat-intel/check-url
 * Secure proxy endpoint for URL reputation queries.
 * Validates candidate URLs, enforces explicit user consent, and shields provider credentials.
 */
export async function POST(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues.map((i) => i.message).join("; "),
        },
        { status: 400 }
      );
    }

    const service = ThreatIntelService.getInstance();
    const reputation = await service.checkUrl(parsed.data);

    return NextResponse.json({
      success: true,
      reputation,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error occurred.";
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}
