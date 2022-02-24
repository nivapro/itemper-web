import { log } from '@/services/logger';
import * as ble from './bluetooth-service';
import { WiFiNetwork, WiFiWriteData } from '@/features/devices/device-data';
import { isWiFiDataValid } from '@/features/devices/device-data-validators';
import { getUuid, UUID_Designator} from './ble-uuid';
// SSID (read/write), Encryption (read/write), Password (write)
export const CurrentWiFiCharacteristicUUID = getUuid(UUID_Designator.CurrentWiFi);

export class CurrentWiFiCharacteristic {
  private characteristic: BluetoothRemoteGATTCharacteristic;
  constructor(characteristic: BluetoothRemoteGATTCharacteristic) {
    this.characteristic = characteristic;
  }
  public async readValue(): Promise<WiFiNetwork> {
    log.debug('current-wifi-characteristic.readValue');
    return  new Promise((resolve, reject) => {
      this.characteristic.readValue().then ((value) => {
        const str = ble.decode(value);
        log.info('current-wifi-characteristic.readValue received' + str);
        try {
          const data = JSON.parse(str);
          if (isWiFiDataValid(data)) {
            resolve(data as WiFiNetwork);
          } else {
            reject('Cannot validate current wifi configuration' + str);
          }
        } catch {
            reject('Cannot parse current wifi configuration: ' + str);
        }
      })
      .catch(() => {
        reject('Cannot retrieve current wifi configuration');
      });
    });
  }
  public async writeValue(value: WiFiWriteData): Promise<void> {
    log.debug('current-wifi-characteristic.writeValue');
    return  this.characteristic.writeValue(ble.encode(JSON.stringify(value)));
  }
}
