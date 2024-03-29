import { log } from '@/services/logger';
import * as ble from './bluetooth-service';
import { DeviceName } from '@/features/devices/device-data';
import { isDeviceNameValid } from '@/features/devices/device-data-validators';
import { getUuid, UUID_Designator} from './ble-uuid';
export const DeviceNameUUID = getUuid(UUID_Designator.DeviceName);

export class DeviceNameCharacteristic {
  private characteristic: BluetoothRemoteGATTCharacteristic;
  constructor(characteristic: BluetoothRemoteGATTCharacteristic) {
    this.characteristic = characteristic;
  }
  public async readValue(): Promise<DeviceName> {
    return  new Promise ((resolve, reject) => {
      this.characteristic.readValue().then ((value) => {
        const str = ble.decode(value);
        log.info('device-name-characteristic.readValue received str=' + str);
        const data = JSON.parse(str);
        if (isDeviceNameValid(data)) {
          resolve(data);
        } else {
          reject('Invalid device name');
        }
      })
      .catch(() => {
        reject('Cannot retrieve device name');
      });
    });
  }
  public async writeValue(value: DeviceName): Promise<void> {
    const valueStr = JSON.stringify(value);
    log.debug('device-name-characteristic.writeValue ' + valueStr);
    return  this.characteristic.writeValue(ble.encode(valueStr));
  }
}
