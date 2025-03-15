import { NextResponse } from "next/server";

export const revalidate = 0;

export async function GET() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_MMWAVE_MIDDLEWARE_URL}/api/network/update`,
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

    return NextResponse.json(
      { message: "網路資料更新成功" },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching network data:", error);
    return NextResponse.json({ error: "網路資料更新失敗" }, { status: 500 });
  }
}
