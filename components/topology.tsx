"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Host, Link } from "@/types";
import { debounce, isEqual } from "lodash";
import { RefreshCcw } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Data, Network, Options } from "vis-network/standalone";

const Topology: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [network, setNetwork] = useState<Network | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const debouncedFetchData = useCallback(
    debounce(async () => {
      const currentTime = Date.now();
      if (currentTime - lastUpdateTime < 5000) {
        return;
      }

      try {
        const response = await fetch("/api/network");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        const formattedLinks = data.links.map((link: any) => ({
          src: {
            dpid: link.source.split(":")[0],
            name: `Port ${link.source.split(":")[1]}`,
          },
          dst: {
            dpid: link.destination.split(":")[0],
            name: `Port ${link.destination.split(":")[1]}`,
          },
        }));

        const formattedHosts = data.hosts.map((host: any) => ({
          mac: host.id,
          ipv4: [host.ip],
          port: {
            dpid: host.connected_to.split(":")[0],
            name: `Port ${host.connected_to.split(":")[1]}`,
          },
        }));

        setLinks((prevLinks) =>
          isEqual(prevLinks, formattedLinks) ? prevLinks : formattedLinks
        );
        setHosts((prevHosts) =>
          isEqual(prevHosts, formattedHosts) ? prevHosts : formattedHosts
        );
        setLastUpdateTime(currentTime);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching topology data:", error);
        setError("獲取拓樸資料失敗");
        setIsLoading(false);
      }
    }, 1000),
    [lastUpdateTime]
  );

  useEffect(() => {
    const fetchDataAndScheduleNext = () => {
      debouncedFetchData();
      fetchTimeoutRef.current = setTimeout(fetchDataAndScheduleNext, 5000);
    };

    fetchDataAndScheduleNext();

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      debouncedFetchData.cancel();
    };
  }, [debouncedFetchData]);

  useEffect(() => {
    if (links.length === 0 && hosts.length === 0) {
      return;
    }

    const nodes = new Set<string>();
    const edges: {
      from: string;
      to: string;
      label: string;
      arrows?: string;
    }[] = [];

    links.forEach((link) => {
      const srcDpid = link.src.dpid.slice(-1);
      const dstDpid = link.dst.dpid.slice(-1);
      nodes.add(srcDpid);
      nodes.add(dstDpid);
      edges.push({
        from: srcDpid,
        to: dstDpid,
        label: `${link.src.name}\n${link.dst.name}`,
        arrows: "to",
      });
    });

    hosts.forEach((host, index) => {
      const hostId = `host_${index}`;
      const switchDpid = host.port.dpid.slice(-1);
      nodes.add(hostId);
      edges.push({
        from: hostId,
        to: switchDpid,
        label: host.port.name,
      });
    });

    const data: Data = {
      nodes: Array.from(nodes).map((node) => {
        if (node.startsWith("host_")) {
          const hostIndex = parseInt(node.split("_")[1]);
          const host = hosts[hostIndex];
          return {
            id: node,
            label: host.ipv4[0],
            shape: "box",
            color: {
              background: "#FFA500",
              border: "#FF8C00",
            },
          };
        } else {
          return {
            id: node,
            label: node.slice(-4),
            title: node,
            shape: "circle",
            color: {
              background: "lightblue",
              border: "#2B7CE9",
            },
          };
        }
      }),
      edges: edges,
    };

    const options: Options = {
      nodes: {
        size: 30,
        font: {
          size: 12,
          color: "#000000",
        },
        borderWidth: 2,
      },
      edges: {
        width: 2,
        font: {
          size: 10,
        },
        arrows: {
          to: {
            enabled: true,
            scaleFactor: 0.5,
          },
        },
      },
    };

    if (containerRef.current) {
      if (network) {
        network.setData(data);
      } else {
        const newNetwork = new Network(containerRef.current, data, options);
        setNetwork(newNetwork);
      }
    }
  }, [links, hosts, network]);

  if (isLoading) {
    return (
      <div className="w-full h-full border border-input rounded-lg flex items-center justify-center">
        Loading Topology...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full border border-input rounded-lg flex items-center justify-center">
        Error: {error}
      </div>
    );
  }

  if (links.length === 0 && hosts.length === 0) {
    return (
      <div className="w-full h-full border border-input rounded-lg flex items-center justify-center">
        No available topology data
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className="h-full w-full border border-input rounded-xl"
      />
      <Button
        className="absolute top-2 right-2"
        variant="outline"
        size="icon"
        onClick={() => {
          fetch("/api/network/update").then((response) => {
            if (response.ok) {
              toast({
                title: "Success",
                description: "Network data updated successfully",
              });
            } else {
              toast({
                title: "Error",
                description: "Please try again later",
              });
            }
          });
        }}
      >
        <RefreshCcw className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default Topology;
