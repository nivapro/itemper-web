import { SensorData } from '@/models/sensor-data';
import { ComputedRef } from '@vue/composition-api';
export interface DeviceData {
     name: string ;
     deviceID: string ;
     key: string;
     color: string;
     statusTime?: number;
     uptime?: number;
}
export type WiFiData = WiFiNetwork;

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
