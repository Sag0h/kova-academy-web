import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createUploadSignature, type CloudinaryUploadScope } from "@/lib/cloudinary";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const requestedScope = request.nextUrl.searchParams.get("scope");
  const scope: CloudinaryUploadScope | null =
    requestedScope === "portfolio" || requestedScope === "services" || requestedScope === "branding"
      ? requestedScope
      : null;
  if (!scope) return NextResponse.json({ error: "Destino de upload inválido." }, { status: 400 });

  const upload = createUploadSignature(scope);
  if (!upload) {
    return NextResponse.json(
      { error: "Cloudinary todavía no está configurado." },
      { status: 503 },
    );
  }

  return NextResponse.json(upload);
}
