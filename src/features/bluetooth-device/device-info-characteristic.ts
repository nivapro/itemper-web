import { log } from '@/services/logger';
import * as ble from './bluetooth-service';
import { DeviceData } from '@/features/devices/device-data';
import { isDeviceDataValid } from '@/features/devices/device-data-validators';
import { getUuid, UUID_Designator} from './ble-uuid';
export const DeviceInfoUUID = getUuid(UUID_Designator.DeviceInfo);

export class DeviceCharacteristic {
  private characteristic: BluetoothRemoteGATTCharacteristic;
  constructor(characteristic: BluetoothRemoteGATTCharacteristic) {
    this.characteristic = characteristic;
  }
  public async readValue(): Promise<DeviceData> {
    return  new Promise ((resolve, reject) => {
      this.characteristic.readValue().then ((value) => {
        const str = ble.decode(value);
        log.info('device-info-characteristic.readValue received str=' + str);
        const data = JSON.parse(str);
        if (isDeviceDataValid(data)) {
          resolve( data as DeviceData);
        } else {
          reject('Invalid device data');
        }
      })
      .catch(() => {
        reject('Cannot retrieve device info');
      });
    });
  }
  public async writeValue(value: DeviceData): Promise<void> {
    const valueStr = JSON.stringify(value);
    log.debug('device-info-characteristic.writeValue ' + valueStr);
    return  this.characteristic.writeValue(ble.encode(valueStr));
  }
}
