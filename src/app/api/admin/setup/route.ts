import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const setupSecret = process.env.ADMIN_SETUP_SECRET;
  if (!setupSecret) {
    return NextResponse.json(
      { error: "ADMIN_SETUP_SECRET が未設定です" },
      { status: 500 }
    );
  }

  const body = await request.json();
  const { secret, email, password, name } = body;

  if (secret !== setupSecret) {
    return NextResponse.json(
      { error: "認証に失敗しました" },
      { status: 403 }
    );
  }

  if (!email || !password) {
    return NextResponse.json(
      { error: "email と password は必須です" },
      { status: 400 }
    );
  }

  try {
    const user = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: name || "Admin",
      },
    });
    return NextResponse.json({ success: true, userId: user.user.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "アカウント作成に失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
