import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (
    !body ||
    typeof body.name !== "string" ||
    typeof body.email !== "string" ||
    typeof body.message !== "string"
  ) {
    return NextResponse.json({ error: "Invalid contact payload" }, { status: 422 });
  }

  return NextResponse.json({
    ok: true,
    message:
      "Contact request accepted. Wire this endpoint to Resend, SendGrid, or an internal CRM webhook in production.",
  });
}
