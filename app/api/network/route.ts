import { NextResponse } from "next/server";

export const revalidate = 0;

export async function GET() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_MMWAVE_MIDDLEWARE_URL}/api/network`,
      {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Error fetching network data:", error);
    return NextResponse.json({ error: "獲取網路資料失敗" }, { status: 500 });
  }
}
