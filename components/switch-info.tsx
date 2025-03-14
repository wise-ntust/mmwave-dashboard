import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import type {
  FlowEntry,
  Meter,
  MeterEntry,
  Switch as SwitchType,
} from "@/types";
import React from "react";

interface SwitchInfoProps {
  selectedSwitchData: SwitchType | null;
  newFlowEntry: string;
  setNewFlowEntry: (value: string) => void;
  addFlowEntry: () => void;
  deleteFlowEntry: (entry: FlowEntry) => void;
  newMeterEntry: string;
  setNewMeterEntry: (value: string) => void;
  addMeterEntry: () => void;
  deleteMeterEntry: (meterId: number) => void;
}

function formatFlowEntry(entry: FlowEntry): string {
  const priority = entry.priority || "Unknown";
  const match = entry.match
    ? Object.entries(entry.match)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ")
    : "No match conditions";
  const actions = Array.isArray(entry.actions)
    ? entry.actions.join(", ")
    : "No actions";
  const length = entry.length !== undefined ? `Length: ${entry.length}` : "";
  const duration =
    entry.duration_sec !== undefined && entry.duration_nsec !== undefined
      ? `Duration: ${entry.duration_sec}s ${entry.duration_nsec}ns`
      : "";
  const packetCount =
    entry.packet_count !== undefined
      ? `Packet Count: ${entry.packet_count}`
      : "";
  const byteCount =
    entry.byte_count !== undefined ? `Byte Count: ${entry.byte_count}` : "";

  return `Priority: ${priority}, Match: ${match}, Actions: ${actions}, ${length}, ${duration}, ${packetCount}, ${byteCount}`;
}

function formatMeterEntry(meter: Meter | MeterEntry): string {
  if ("flags" in meter && "bands" in meter) {
    const flags = Array.isArray(meter.flags)
      ? meter.flags.join(", ")
      : meter.flags;
    const bands = meter.bands
      .map(
        (band: { type: string; rate: number; burst_size?: number }) =>
          `Type: ${band.type}, Rate: ${band.rate}${
            band.burst_size ? `, Burst: ${band.burst_size}` : ""
          }`
      )
      .join("; ");
    return `Meter ID: ${meter.meter_id}, Flags: ${flags}, Bands: [${bands}]`;
  }

  return `Meter ID: ${meter.meter_id}, Flow Count: ${meter.flow_count}, Packet Count: ${meter.packet_in_count}, Byte Count: ${meter.byte_in_count}, Duration: ${meter.duration_sec}s ${meter.duration_nsec}ns`;
}

const SwitchInfo: React.FC<SwitchInfoProps> = ({
  selectedSwitchData,
  newFlowEntry,
  setNewFlowEntry,
  addFlowEntry,
  deleteFlowEntry,
  newMeterEntry,
  setNewMeterEntry,
  addMeterEntry,
  deleteMeterEntry,
}) => {
  return (
    <ScrollArea className="w-full h-full border border-input rounded-lg p-4">
      {selectedSwitchData ? (
        <div>
          <h3 className="text-lg font-semibold mb-2">
            Switch {selectedSwitchData.id}
          </h3>
          {selectedSwitchData.desc && (
            <div className="mb-2 text-sm">
              <ul className="list-disc pl-5">
                <li>製造商: {selectedSwitchData.desc.mfr_desc}</li>
                <li>硬體: {selectedSwitchData.desc.hw_desc}</li>
                <li>軟體: {selectedSwitchData.desc.sw_desc}</li>
                <li>序號: {selectedSwitchData.desc.serial_num}</li>
                <li>資料平面描述: {selectedSwitchData.desc.dp_desc}</li>
              </ul>
            </div>
          )}
          {selectedSwitchData.aggregateFlow &&
            selectedSwitchData.aggregateFlow.length > 0 && (
              <div className="mb-2 text-sm">
                <h4 className="font-semibold">聚合流量資訊:</h4>
                <ul className="list-disc pl-5">
                  <li>
                    封包數: {selectedSwitchData.aggregateFlow[0].packet_count}
                  </li>
                  <li>
                    位元組數: {selectedSwitchData.aggregateFlow[0].byte_count}
                  </li>
                  <li>
                    流表數: {selectedSwitchData.aggregateFlow[0].flow_count}
                  </li>
                </ul>
              </div>
            )}
          {selectedSwitchData.meters &&
            selectedSwitchData.meters.length > 0 && (
              <div className="mb-2 text-sm">
                <h4 className="font-semibold">限速器資訊:</h4>
                <ul className="list-disc pl-5">
                  {selectedSwitchData.meters.map((meter, index) => (
                    <li key={index} className="mb-2">
                      <div>限速器 ID: {meter.meter_id}</div>
                      <div className="pl-4">
                        <div>流表數量: {meter.flow_count}</div>
                        <div>接收封包數: {meter.packet_in_count}</div>
                        <div>接收位元組數: {meter.byte_in_count}</div>
                        <div>
                          持續時間: {meter.duration_sec}秒{" "}
                          {(meter.duration_nsec / 1000000).toFixed(2)}毫秒
                        </div>
                        {meter.band_stats.map((band, bandIndex) => (
                          <div key={bandIndex} className="mt-1">
                            <div>限速封包數: {band.packet_band_count}</div>
                            <div>限速位元組數: {band.byte_band_count}</div>
                          </div>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          <div className="mb-2 text-sm">
            <div className="flex">
              <h4 className="font-semibold">Meter Information:</h4>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="ml-2 text-green-500">ADD</button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>Add Meter Entry</DialogTitle>
                  <Textarea
                    value={newMeterEntry}
                    onChange={(e) => setNewMeterEntry(e.target.value)}
                    className="w-full h-[40rem]"
                  />
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button onClick={addMeterEntry}>新增</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button variant="ghost">取消</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            {selectedSwitchData.meters &&
            selectedSwitchData.meters.length > 0 ? (
              <ul className="list-disc pl-5">
                {selectedSwitchData.meters.map((meter, index) => (
                  <li key={index} className="mb-2">
                    {formatMeterEntry(meter)}
                    <button
                      className="ml-2 text-red-500"
                      onClick={() => deleteMeterEntry(meter.meter_id)}
                    >
                      DEL
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No meter entries found.</p>
            )}
          </div>
          {Array.isArray(selectedSwitchData.flowTable) &&
          selectedSwitchData.flowTable.length > 0 ? (
            <div className="mb-2 text-sm">
              <div className="flex">
                <h4 className="font-semibold">Flow Table Information:</h4>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="ml-2 text-green-500">ADD</button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogTitle>Add Flow Entry</DialogTitle>
                    <Textarea
                      value={newFlowEntry}
                      onChange={(e) => setNewFlowEntry(e.target.value)}
                      className="w-full h-[40rem]"
                    />
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button onClick={addFlowEntry}>新增</Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button variant="ghost">取消</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <ul className="list-disc pl-5">
                {selectedSwitchData.flowTable.map((entry, index) => (
                  <li key={index} className="mb-2">
                    {formatFlowEntry(entry)}
                    <button
                      className="ml-2 text-red-500"
                      onClick={() => deleteFlowEntry(entry)}
                    >
                      DEL
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>
              This switch currently has no flow table entries. (Flow table
              length: {selectedSwitchData.flowTable?.length || 0})
            </p>
          )}
        </div>
      ) : (
        <p>請點選地圖上的節點以查看交換機資訊。</p>
      )}
    </ScrollArea>
  );
};

export default SwitchInfo;
