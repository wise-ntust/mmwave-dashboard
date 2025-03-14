export interface Node {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface LinkEndpoint {
  dpid: string;
  port_no: string;
  hw_addr: string;
  name: string;
}

export interface Link {
  src: LinkEndpoint;
  dst: LinkEndpoint;
}

export interface Host {
  mac: string;
  ipv4: string[];
  ipv6: string[];
  port: {
    dpid: string;
    port_no: string;
    hw_addr: string;
    name: string;
  };
}

export interface MeterBandStats {
  packet_band_count: number;
  byte_band_count: number;
}

export interface Meter {
  len: number;
  flow_count: number;
  packet_in_count: number;
  byte_in_count: number;
  duration_sec: number;
  duration_nsec: number;
  band_stats: MeterBandStats[];
  meter_id: number;
}

export interface FlowEntry {
  dpid: number;
  table_id?: number;
  priority: number;
  match: {
    in_port?: number;
    eth_type?: number;
    ipv4_src?: string;
    ipv4_dst?: string;
    dl_dst?: string;
    dl_type?: number;
  };
  actions: {
    type: string;
    port?: number;
    meter_id?: number;
  }[];
  cookie?: number;
  cookie_mask?: number;
  idle_timeout?: number;
  hard_timeout?: number;
  flags?: number;
  length?: number;
  duration_sec?: number;
  duration_nsec?: number;
  packet_count?: number;
  byte_count?: number;
}

export interface SwitchDesc {
  mfr_desc: string;
  hw_desc: string;
  sw_desc: string;
  serial_num: string;
  dp_desc: string;
}

export interface AggregateFlow {
  packet_count: number;
  byte_count: number;
  flow_count: number;
}

export interface Switch {
  id: number;
  flowTable: FlowEntry[];
  desc?: SwitchDesc;
  aggregateFlow?: AggregateFlow[];
  meters?: Meter[];
}

export interface MeterBand {
  type: string;
  rate: number;
  burst_size?: number;
  prec_level?: number;
}

export interface MeterEntry {
  flags: string[];
  meter_id: number;
  bands: {
    type: string;
    rate: number;
    burst_size?: number;
    prec_level?: number;
  }[];
}
