import { NextResponse } from "next/server";

export const revalidate = 0;

const PYTHON_API_BASE = `${process.env.NEXT_PUBLIC_MMWAVE_MIDDLEWARE_URL}/api`;

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const body = await request.json();
    console.log(`新增交換機 ${id} 的限速器:`, body);

    const response = await fetch(`${PYTHON_API_BASE}/switch/${id}/meter/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dpid: parseInt(id),
        flags: body.flags || "KBPS",
        meter_id: body.meter_id || 1,
        bands: body.bands || [
          {
            type: "DROP",
            rate: body.rate || 1000,
            burst_size: body.burst_size || 0,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `新增限速器失敗: ${response.statusText}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`新增交換機 ${id} 的限速器失敗:`, error);
    return NextResponse.json(
      { error: `新增交換機 ${id} 的限速器失敗` },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const body = await request.json();
    console.log(`刪除交換機 ${id} 的限速器:`, body);

    const response = await fetch(
      `${PYTHON_API_BASE}/switch/${id}/meter/delete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dpid: parseInt(id),
          meter_id: body.meter_id || 1,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `刪除限速器失敗: ${response.statusText}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`刪除交換機 ${id} 的限速器失敗:`, error);
    return NextResponse.json(
      { error: `刪除交換機 ${id} 的限速器失敗` },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  console.log(`獲取交換機 ${id} 的限速器列表`);
  try {
    const response = await fetch(`${PYTHON_API_BASE}/switch/${id}/meter`);
    if (!response.ok) {
      throw new Error(`獲取資料失敗: ${response.statusText}`);
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`獲取交換機 ${id} 的限速器列表失敗:`, error);
    return NextResponse.json(
      { error: `獲取交換機 ${id} 的限速器列表失敗` },
      { status: 500 }
    );
  }
}
