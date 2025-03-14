import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch("http://0.0.0.0:8800/api/process-request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_input: body.message,
      }),
    });

    if (!response.ok) {
      throw new Error("請求失敗");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("處理聊天請求時發生錯誤:", error);
    return NextResponse.json({ error: "處理請求失敗" }, { status: 500 });
  }
}
