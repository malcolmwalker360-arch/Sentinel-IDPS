export enum Severity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface Alert {
  id: string;
  timestamp: Date;
  sourceIp: string;
  destinationIp: string;
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'HTTP';
  severity: Severity;
  type: string;
  payload: string; // The suspicious packet content or log line
  status: 'NEW' | 'ANALYZING' | 'RESOLVED' | 'IGNORED';
  analysis?: string;
  snoozedUntil?: Date;
}

export interface TrafficPoint {
  time: string;
  inboundMb: number;
  outboundMb: number;
  packets: number;
}

export interface SystemStats {
  cpu: number;
  memory: number;
  activeConnections: number;
  blockedToday: number;
}