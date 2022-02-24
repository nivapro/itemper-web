import { log } from '@/services/logger';
import * as ble from './bluetooth-service';
import { DeviceKey } from '@/features/devices/device-data';
import { isDeviceKeyValid } from '@/features/devices/device-data-validators';
import { getUuid, UUID_Designator} from './ble-uuid';
export const DeviceKeyUUID = getUuid(UUID_Designator.DeviceKey);

export class DeviceKeyCharacteristic {
  private characteristic: BluetoothRemoteGATTCharacteristic;
  constructor(characteristic: BluetoothRemoteGATTCharacteristic) {
    this.characteristic = characteristic;
  }
  public async readValue(): Promise<DeviceKey> {
    return  new Promise ((resolve, reject) => {
      this.characteristic.readValue().then ((value) => {
        const str = ble.decode(value);
        log.info('device-key-characteristic.readValue received str=' + str);
        const data = JSON.parse(str);
        if (isDeviceKeyValid(data)) {
          resolve(data);
        } else {
          reject('Invalid device key');
        }
      })
      .catch(() => {
        reject('Cannot retrieve device key');
      });
    });
  }
  public async writeValue(value: DeviceKey): Promise<void> {
    const valueStr = JSON.stringify(value);
    log.debug('device-key-characteristic.writeValue ' + valueStr);
    return  this.characteristic.writeValue(ble.encode(valueStr));
  }
}
