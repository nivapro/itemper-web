import { log } from '@/services/logger';
import { AvailableWiFiCharacteristicUUID, AvailableWiFiCharacteristic} from './available-wifi-characteristics';
import { CurrentWiFiCharacteristicUUID, CurrentWiFiCharacteristic} from './current-wifi-characteristic';
import { DeviceCharacteristicUUID, DeviceCharacteristic} from './device-info-characteristic';
import { UUID_Designator, getUuid } from './ble-uuid';
import { json } from '@/helpers';
const PrimaryService = getUuid(UUID_Designator.PrimaryService);

// filters: [{
//   name: 'Francois robot'
// }],
// optionalServices: ['battery_service']
// 1ad01b31-dd4b-478c-9aa3-12bd90900000

// const DeviceOptions = {
//   filters: [{
//     namePrefix: 'itemper',
//     optionalServices: [PrimaryService, 'a449e701-371a-48b4-a8a5-e8105127c123'],
//   }],
// };

const DeviceOptions = {
  filters: [{
    services: [PrimaryService],
  }],
};
export interface BtCharacteristics {
  device: DeviceCharacteristic;
  // deviceName: DeviceNameCharacteristic;
  current: CurrentWiFiCharacteristic;
  available: AvailableWiFiCharacteristic;
}
export enum BtStatus {Disconnected, Paring, Connecting, Connected, Disconnecting}

export class BtService {
  private btDevice: BluetoothDevice | undefined;
  private btStatus = BtStatus.Disconnected;

  constructor(private onChanged: (newStatus: BtStatus) => void) {
    log.debug('bluetooth-service.constructor');
  }

  public async getCharacteristics(): Promise<BtCharacteristics> {
      try {
        log.debug('useBluetooth.getCharacteristics: Pairing device');
        this.setStatus(BtStatus.Paring);
        this.btDevice = await this.pairDevice();
        log.debug('useBluetooth.getCharacteristics: Device paired');
        this.setStatus(BtStatus.Connecting);
        log.debug('useBluetooth.getCharacteristics: connecting GATT server');
        const server = await this.connectServer(this.btDevice);
        log.debug('useBluetooth.getCharacteristics: GATT server connected, get primary service');
        const service = await this.getService(server);
        log.debug('useBluetooth.getCharacteristics: Primary service found, read characteristics');
        const device = await this.getDevice(service);
        log.debug('useBluetooth.getCharacteristics: Device info characteristic read');
        const current = await this.getCurrentWiFi(service);
        log.debug('useBluetooth.getCharacteristics: Current WiFi characteristic read');
        const available = await this.getAvailableWiFi(service);
        log.debug('useBluetooth.getCharacteristics: Available WiFi characteristic read');
        this.setStatus(BtStatus.Connected);
        return { device, current, available };
      } catch (e) {
        log.error('bluetooth-service.getCharacteristics: ' + e);
        throw Error('Cannot get Bluetooth characteristics');
      }
  }
  public get name() {
    if (this.btDevice) {
      if (this.btDevice.name) {
        return this.btDevice.name;
      } else {
        return this.btDevice.id;
      }
    } else {
      return '';
    }
  }
  // disconnect from peripheral
  public disconnect() {
    this.setStatus(BtStatus.Disconnecting);
    if (this.btDevice && this.btDevice.gatt && this.btDevice.gatt.connected) {
        this.btDevice.gatt.disconnect();
    } else {
      this.onDisconnected();
    }
  }
  private setStatus(status: BtStatus) {
    if (status !== this.btStatus) {
      this.btStatus = status;
      this.onChanged(status);
      log.info('bluetooth-service.setStatus: ' + BtStatus[status]);
    }
  }
  private onDisconnected() {
    if (this.btDevice) {
      this.btDevice.removeEventListener('gattserverdisconnected', this.onDisconnected.bind(this));
      this.btDevice = undefined;
    }
    this.setStatus(BtStatus.Disconnected);
    log.info('bluetooth-service.onDisconnected');
  }
  private async pairDevice(): Promise<BluetoothDevice> {
    try {
        log.info('bluetooth-service.pairDevice: pair device ' + json(DeviceOptions));
        const btDevice =  await navigator.bluetooth.requestDevice(DeviceOptions);
        log.info('bluetooth-service.pairDevice: successfully paired device ' + btDevice.name);
        return btDevice;
      } catch (e) {
        log.error('bluetooth-service.pairDevice: catched error' + e);
        throw new Error ('Cannot pair bluetooth device');
    }
  }
  private async connectServer(btDevice: BluetoothDevice): Promise<BluetoothRemoteGATTServer> {
    if (!btDevice.gatt) {
      log.info('bluetooth-service.connectServer: No GATT server available');
      throw Error('No GATT server');
    }
    try {
      const server = await btDevice.gatt.connect();
      btDevice.addEventListener('gattserverdisconnected', this.onDisconnected.bind(this));
      return server;
    } catch (e) {
      log.error('bluetooth-service.connectServer: error=' + e);
      throw Error('Cannot connect to GATT server');
    }
}

  private async getService(server: BluetoothRemoteGATTServer): Promise<BluetoothRemoteGATTService> {
    try {
      log.debug('bluetooth-service.getService: PrimaryService=[' + PrimaryService + ']');
      const service = await server.getPrimaryService(PrimaryService);
      return service;
    } catch (e) {
      log.info('bluetooth-service.getService:  error=' + e);
      throw Error('Cannot get Primary Service=' + PrimaryService);
    }
}
  private async getDevice(service: BluetoothRemoteGATTService): Promise<DeviceCharacteristic> {
    try {
      log.debug('useBluetooth.getDevice: Getting Device info');
      const characteristic = await service.getCharacteristic(DeviceCharacteristicUUID);
      log.debug('useBluetooth.getDevice: Device info characteristic found');
      return new DeviceCharacteristic(characteristic);
    } catch (e) {
      log.info('bluetooth-service.getDevice: error=' + e);
      throw new Error ('Cannot get device info characteristics');
    }
  }
  // private async getDeviceName(service: BluetoothRemoteGATTService): Promise<DeviceNameCharacteristic> {
  //   try {
  //     const characteristic = await service.getCharacteristic(DeviceNameCharacteristicUUID);
  //     return new DeviceNameCharacteristic(characteristic);
  //   } catch {
  //     log.info('bluetooth-service.getDevice: catched error');
  //     throw new Error ('Cannot get device info characteristics');
  //   }
  // }
  private async getCurrentWiFi(service: BluetoothRemoteGATTService): Promise<CurrentWiFiCharacteristic> {
    try {
      const characteristic = await service.getCharacteristic(CurrentWiFiCharacteristicUUID);
      return new CurrentWiFiCharacteristic(characteristic);
    } catch (e) {
      log.info('bluetooth-service.getCurrentWiFi: error=' + e);
      throw new Error ('Cannot get current WiFi characteristics');
    }
  }
  private async getAvailableWiFi(service: BluetoothRemoteGATTService):
              Promise<AvailableWiFiCharacteristic> {
    try {
      const characteristic = await service.getCharacteristic(AvailableWiFiCharacteristicUUID);
      return new AvailableWiFiCharacteristic(characteristic);
    } catch (e) {
      log.info('bluetooth-service.getAvailableWiFi: error=' + e);
      throw new Error ('Cannot get available network characteristics');
    }
  }
  private async getCharacteristic(service: BluetoothRemoteGATTService,
                                  characteristicUUID: string): Promise<BluetoothRemoteGATTCharacteristic> {
    try {
      log.debug('bluetooth-service.getCharacteristic: ' + characteristicUUID);
      return await service.getCharacteristic(characteristicUUID);
    } catch {
      log.info('bluetooth-service.getCharacteristic: catched error');
      throw new Error ('Cannot get itemper Bluetooth characteristic: ' + characteristicUUID);
    }

  }

  private watchAvailability(availability: (isAvailable: boolean) => void): void {
    log.debug('bluetooth-service.watchAvailability');
    navigator.permissions.query({name: 'bluetooth'}).then((status: PermissionStatus) => {
      availability(status.state !== 'denied');
      // Bluetooth is blocked, listen for change in PermissionStatus.
      status.onchange = () => {
          availability(status.state !== 'denied');
      };
    });
  }
  // handler to run when device successfully disconnects
}
async function run<T>(MaxRetries: number, fn: (...args: any[]) => Promise<T>, ...args: any[]): Promise<T> {
  let retries = 0;
  while (retries <= MaxRetries) {
    try {
      log.info('bluetooth-services.run, arguments: ' + JSON.stringify(fn.arguments));
      return await fn(...args);
    } catch (e) {
      log.error('bluetooth-services.run: ' + JSON.stringify(e));
      if (retries < MaxRetries) {
        await delay(1000 * Math.pow(2, retries));
      }
      retries += 1;
    }
  }
  throw Error('Cannot run async function');
}
async function delay(ms: number): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), ms);
  });
}
// helper function to decode message sent from peripheral
export function decode(buf: BufferSource): string {
  log.debug('bluetooth-service.decode');
  const dec = new TextDecoder('utf-8');
  return dec.decode(buf);
}
export function encode(value: string ): BufferSource {
  log.debug('bluetooth-service.encode');
  const enc = new TextEncoder();
  return enc.encode(value);
}
