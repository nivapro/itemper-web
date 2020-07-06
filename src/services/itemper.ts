import { ApiService } from './api-service';
import { AdminService } from './admin-service';
import { DeviceService } from './device-service';
import { EventService } from './event-service';
import { LocationService } from '../features/locations';
import { SensorService } from './sensor-service';

export interface IiTemper {
    apiService: ApiService;
    deviceService: DeviceService;
    locationService: LocationService;
    sensorService: SensorService;
}
export class Itemper implements IiTemper {
    public apiService = new ApiService();
    public adminService =  new AdminService(this.apiService);
    public deviceService =  new DeviceService(this.apiService);
    public eventService = new EventService();
    public locationService =  new LocationService(this.apiService);
    public sensorService =  new SensorService(this.apiService);
}
