import { log } from '@/services/logger';
import * as ble from './bluetooth-service';
import { DeviceColor } from '@/features/devices/device-data';
import { isDeviceColorValid } from '@/features/devices/device-data-validators';
import { getUuid, UUID_Designator} from './ble-uuid';
export const DeviceColorUUID = getUuid(UUID_Designator.DeviceColor);

export class DeviceColorCharacteristic {
  private characteristic: BluetoothRemoteGATTCharacteristic;
  constructor(characteristic: BluetoothRemoteGATTCharacteristic) {
    this.characteristic = characteristic;
  }
  public async readValue(): Promise<DeviceColor> {
    return  new Promise ((resolve, reject) => {
      this.characteristic.readValue().then ((value) => {
        const str = ble.decode(value);
        log.info('device-color-characteristic.readValue received str=' + str);
        const data = JSON.parse(str);
        if (isDeviceColorValid(data)) {
          resolve(data);
        } else {
          reject('Invalid device color');
        }
      })
      .catch(() => {
        reject('Cannot retrieve device color');
      });
    });
  }
  public async writeValue(value: DeviceColor): Promise<void> {
    const valueStr = JSON.stringify(value);
    log.debug('device-name-characteristic.writeValue ' + valueStr);
    return  this.characteristic.writeValue(ble.encode(valueStr));
  }
}
