import { SensorData } from '@/models/sensor-data';
export interface DeviceName {
     name: string;
}
export interface DeviceColor {
     color: string ;
}
export interface DeviceKey {
     key: string ;
}  
export interface DeviceData {
     name: string ;
     deviceID: string ;
     key: string;
     color: string;
     statusTime?: number;
     deviceData?: DeviceStatus;
}
export type WiFiData = WiFiNetwork;

export interface WiFiWriteData  {
     ssid: string;
     password: string;
 }
export interface WiFiNetwork {
     ssid: string;
     security: string;
     quality: number;
     channel: number;
}
export interface DeviceWiFiData {
     current: WiFiData;
     available: WiFiData[];
}
export interface DeviceState {
     deviceData: DeviceData;
     networks: DeviceWiFiData;
     sensors: SensorData[];
}

export interface NetworkInterfaceInfo {
     address: string;
     netmask: string;
     family: string;
     mac: string;
     internal: boolean;
 }
 export interface DeviceStatus {
     timestamp: number;
     hostname: string;
     uptime: number;
     networkInterfaces: { [index: string]: NetworkInterfaceInfo[] };
 }
 
