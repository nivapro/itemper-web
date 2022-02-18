import { log } from '@/services/logger';
import * as ble from './bluetooth-service';
import { DeviceName } from '@/features/devices/device-data';
import { isDeviceNameValid } from '@/features/devices/device-data-validators';
import { getUuid, UUID_Designator} from './ble-uuid';
// export const DeviceNameCharacteristicUUID = getUuid(UUID_Designator.DeviceName);

// export class DeviceNameCharacteristic {
//   private characteristic: BluetoothRemoteGATTCharacteristic;
//   constructor(characteristic: BluetoothRemoteGATTCharacteristic) {
//     this.characteristic = characteristic;
//   }
//   public async readValue(): Promise<DeviceName> {
//     return  new Promise ((resolve, reject) => {
//       this.characteristic.readValue().then ((value) => {
//         const str = ble.decode(value);
//         log.info('device-info-characteristic.readValue received str=' + str);
//         const data = JSON.parse(str);
//         if (isDeviceNameValid(data)) {
//           resolve( data as DeviceName);
//         } else {
//           reject('Invalid device data');
//         }
//       })
//       .catch(() => {
//         reject('Cannot retrieve device info');
//       });
//     });

//   }
//   public async writeValue(value: DeviceName): Promise<void> {
//     log.debug('device-info-characteristic.writeValue');
//     return  this.characteristic.writeValue(ble.encode(JSON.stringify(value)));
//   }
// }
