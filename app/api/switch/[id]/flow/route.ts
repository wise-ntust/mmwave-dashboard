import { NextResponse } from "next/server";

export const revalidate = 0;

const PYTHON_API_BASE = `${process.env.NEXT_PUBLIC_MMWAVE_MIDDLEWARE_URL}/api`;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  console.log(`獲取交換機 ${id} 的流表`);
  try {
    const response = await fetch(`${PYTHON_API_BASE}/network`);
    if (!response.ok) {
      throw new Error(`獲取資料失敗: ${response.statusText}`);
    }
    const data = await response.json();
    const switchData = data.switches.find((s: { id: string }) => s.id === id);
    if (!switchData) {
      throw new Error(`找不到交換機 ${id}`);
    }
    return NextResponse.json(switchData.flow_tables);
  } catch (error) {
    console.error(`獲取交換機 ${id} 的流表失敗:`, error);
    return NextResponse.json(
      { error: `獲取交換機 ${id} 的流表失敗` },
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
    console.log(`刪除交換機 ${id} 的流表條目:`, body);

    const response = await fetch(
      `${PYTHON_API_BASE}/switch/${id}/flow/delete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          table_id: body.table_id || 0,
          priority: body.priority || 1,
          match: body.match || {},
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.detail || `刪除流表條目失敗: ${response.statusText}`
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`刪除交換機 ${id} 的流表條目失敗:`, error);
    return NextResponse.json(
      { error: `刪除交換機 ${id} 的流表條目失敗` },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const body = await request.json();
    console.log(`新增交換機 ${id} 的流表條目:`, body);

    const response = await fetch(`${PYTHON_API_BASE}/switch/${id}/flow/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.detail || `新增流表條目失敗: ${response.statusText}`
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`新增交換機 ${id} 的流表條目失敗:`, error);
    return NextResponse.json(
      { error: `新增交換機 ${id} 的流表條目失敗` },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const body = await request.json();
    console.log(`修改交換機 ${id} 的流表條目:`, body);

    const response = await fetch(
      `${PYTHON_API_BASE}/switch/${id}/flow/modify`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.detail || `修改流表條目失敗: ${response.statusText}`
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`修改交換機 ${id} 的流表條目失敗:`, error);
    return NextResponse.json(
      { error: `修改交換機 ${id} 的流表條目失敗` },
      { status: 500 }
    );
  }
}
