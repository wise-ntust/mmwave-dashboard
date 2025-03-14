"use client";

import { Suspense, lazy } from "react";

const Map = lazy(() => import("@/components/map"));
const SwitchInfo = lazy(() => import("@/components/switch-info"));
const Topology = lazy(() => import("@/components/topology"));
const Chat = lazy(() => import("@/components/chat"));

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import type { Switch as SwitchType } from "@/types";
import { FlowEntry } from "@/types";
import { useCallback, useEffect, useState } from "react";

export default function Dashboard() {
  const [networkData, setNetworkData] = useState<any>(null);
  const [selectedSwitchData, setSelectedSwitchData] =
    useState<SwitchType | null>(null);
  const [selectedSwitchId, setSelectedSwitchId] = useState<string | null>("1");
  const [newFlowEntry, setNewFlowEntry] = useState<string>(
    JSON.stringify(
      {
        dpid: 1,
        cookie: 0,
        table_id: 0,
        idle_timeout: 0,
        hard_timeout: 0,
        priority: 1,
        flags: 0,
        match: {
          in_port: 1,
        },
        actions: [
          {
            type: "OUTPUT",
            port: 2,
          },
        ],
      },
      null,
      2
    )
  );

  const [newMeterEntry, setNewMeterEntry] = useState<string>(
    JSON.stringify(
      {
        dpid: 1,
        flags: "KBPS",
        meter_id: 1,
        bands: [
          {
            type: "DROP",
            rate: 1000,
            burst_size: 100,
          },
        ],
      },
      null,
      2
    )
  );

  const fetchNetworkData = useCallback(async () => {
    try {
      const updateResponse = await fetch("/api/network/update");
      if (!updateResponse.ok) {
        throw new Error("更新網路資料失敗");
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      const response = await fetch("/api/network");
      if (response.ok) {
        const data = await response.json();
        setNetworkData(data);

        if (selectedSwitchId) {
          const switchData = data.switches.find(
            (s: any) => s.id === selectedSwitchId
          );
          if (switchData) {
            setSelectedSwitchData({
              id: switchData.id,
              flowTable: switchData.flow_tables,
              desc: {
                mfr_desc: switchData.description.mfr_desc,
                hw_desc: switchData.description.hw_desc,
                sw_desc: switchData.description.sw_desc,
                serial_num: switchData.description.serial_num,
                dp_desc: switchData.description.dp_desc,
              },
              aggregateFlow: switchData.aggregate_flows,
              meters: switchData.meters,
            });
          }
        }
      } else {
        throw new Error("獲取網路資料失敗");
      }
    } catch (error) {
      console.error("獲取網路資料時發生錯誤:", error);
    }
  }, [selectedSwitchId]);

  useEffect(() => {
    fetchNetworkData();
    const interval = setInterval(fetchNetworkData, 30000);
    return () => clearInterval(interval);
  }, [fetchNetworkData]);

  useEffect(() => {
    if (selectedSwitchId && networkData) {
      const switchData = networkData.switches.find(
        (s: any) => s.id === selectedSwitchId
      );
      if (switchData) {
        setSelectedSwitchData({
          id: switchData.id,
          flowTable: switchData.flow_tables,
          desc: {
            mfr_desc: switchData.description.mfr_desc,
            hw_desc: switchData.description.hw_desc,
            sw_desc: switchData.description.sw_desc,
            serial_num: switchData.description.serial_num,
            dp_desc: switchData.description.dp_desc,
          },
          aggregateFlow: switchData.aggregate_flows,
          meters: switchData.meters,
        });
      }
    }
  }, [selectedSwitchId, networkData]);

  const deleteFlowEntry = async (entry: FlowEntry) => {
    try {
      const response = await fetch(`/api/switch/${selectedSwitchId}/flow`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dpid: selectedSwitchId,
          table_id: entry.table_id || 0,
          priority: entry.priority || 1,
          match: entry.match || {},
        }),
      });

      if (!response.ok) {
        throw new Error("刪除流表條目失敗");
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
      await fetchNetworkData();
    } catch (error) {
      console.error("刪除流表條目時發生錯誤:", error);
    }
  };

  const addFlowEntry = async () => {
    try {
      const response = await fetch(`/api/switch/${selectedSwitchId}/flow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: newFlowEntry,
      });

      if (!response.ok) {
        throw new Error("新增流表條目失敗");
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
      await fetchNetworkData();
    } catch (error) {
      console.error("新增流表條目時發生錯誤:", error);
    }
  };

  const addMeterEntry = async () => {
    try {
      const response = await fetch(`/api/switch/${selectedSwitchId}/meter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: newMeterEntry,
      });

      if (!response.ok) {
        throw new Error("新增 meter 條目失敗");
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
      await fetchNetworkData();
    } catch (error) {
      console.error("新增 meter 條目時發生錯誤:", error);
    }
  };

  const deleteMeterEntry = async (meterId: number) => {
    try {
      const response = await fetch(`/api/switch/${selectedSwitchId}/meter`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dpid: parseInt(selectedSwitchId!),
          meter_id: meterId,
        }),
      });

      if (!response.ok) {
        throw new Error("刪除 meter 條目失敗");
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
      await fetchNetworkData();
    } catch (error) {
      console.error("刪除 meter 條目時發生錯誤:", error);
    }
  };

  const defaultPositions: { [key: string]: { lat: number; lng: number } } = {
    "1": { lat: 25.012148367198414, lng: 121.54131693029791 },
    "2": { lat: 25.012248367198414, lng: 121.54141693029791 },
    "3": { lat: 25.012348367198414, lng: 121.54151693029791 },
    "4": { lat: 25.012448367198414, lng: 121.54161693029791 },
  };

  const mapNodes =
    networkData?.switches.map((sw: any) => ({
      id: sw.id,
      name: sw.name,
      lat: defaultPositions[sw.id]?.lat || 25.012148367198414,
      lng: defaultPositions[sw.id]?.lng || 121.54131693029791,
    })) || [];

  return (
    <>
      <main className="w-dvw h-dvh p-2">
        <ResizablePanelGroup
          autoSaveId="resizable-panel-group-1"
          direction="horizontal"
        >
          <ResizablePanel>
            <Suspense
              fallback={
                <div className="w-full h-full border border-input rounded-lg flex items-center justify-center">
                  Loading Switch Info...
                </div>
              }
            >
              <SwitchInfo
                selectedSwitchData={selectedSwitchData}
                newFlowEntry={newFlowEntry}
                setNewFlowEntry={setNewFlowEntry}
                addFlowEntry={addFlowEntry}
                deleteFlowEntry={deleteFlowEntry}
                newMeterEntry={newMeterEntry}
                setNewMeterEntry={setNewMeterEntry}
                addMeterEntry={addMeterEntry}
                deleteMeterEntry={deleteMeterEntry}
              />
            </Suspense>
          </ResizablePanel>
          <ResizableHandle className="bg-transparent p-1" />
          <ResizablePanel>
            <ResizablePanelGroup
              autoSaveId="resizable-panel-group-2"
              direction="vertical"
            >
              <ResizablePanel>
                <Suspense
                  fallback={
                    <div className="w-full h-full border border-input rounded-lg flex items-center justify-center">
                      Loading Topology...
                    </div>
                  }
                >
                  <Topology />
                </Suspense>
              </ResizablePanel>
              <ResizableHandle className="bg-transparent p-1" />
              <ResizablePanel>
                <Suspense
                  fallback={
                    <div className="w-full h-full border border-input rounded-lg flex items-center justify-center">
                      Loading Map...
                    </div>
                  }
                >
                  <Map
                    nodes={mapNodes}
                    selectedSwitchId={selectedSwitchId}
                    setSelectedSwitchId={setSelectedSwitchId}
                  />
                </Suspense>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle className="bg-transparent p-1" />
          <ResizablePanel>
            <Suspense
              fallback={
                <div className="w-full h-full border border-input rounded-lg flex items-center justify-center">
                  Loading Chat...
                </div>
              }
            >
              <Chat />
            </Suspense>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </>
  );
}
