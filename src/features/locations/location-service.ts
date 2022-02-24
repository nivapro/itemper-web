import { Location, LocationData } from '@/features/locations';
import { Sensor } from '@/models/sensor';
import { Descriptor } from '@/models/sensor-data';
import { IApiService, Method } from '@/services/api-service';
import { log } from '@/services/logger';

export interface ILocationService {
        getLocations(): Promise<LocationData[]>;
        createLocation(form: FormData): Promise<LocationData>;
        updateFile(form: FormData, location: Location): Promise<LocationData>;
        updateName(newName: string, location: Location): Promise<LocationData>;
        updateColor(newColor: string, location: Location): Promise<LocationData>;
        updateSensors(newSensors: Sensor[], location: Location): Promise<LocationData>;
        // updateLocation(location: Location): Promise<Location>;
        deleteLocation(location: Location): Promise<LocationData>;
}
export class LocationService implements ILocationService {

    private api: IApiService;
    private path = '/locations';

    constructor(apiService: IApiService) {
        this.api = apiService;
    }
    public getLocations(): Promise<LocationData[]> {
        log.debug('LocationService. getLocations');
        const method: Method = 'get';
        return this.api.request(method, this.path);
    }
    public createLocation(form: FormData): Promise<LocationData> {
        const method: Method = 'post';
        const config = { headers: {
            'Content-Type': 'multipart/form-data',
        }};
        return this.api.request(method, this.path, form, config);
    }
    public  updateFile(form: FormData, location: Location): Promise<LocationData> {
        const path = this.path + '/' + location._id + '/file';
        const method: Method = 'put';
        const config = { headers: {
            'Content-Type': 'multipart/form-data',
        }};
        return this.api.request(method, path, form, config);
    }
    public updateName(newName: string, location: Location): Promise<LocationData> {
        const path = this.path + '/' + location._id + '/name';
        const method: Method = 'put';
        const body = { name: newName };
        return this.api.request(method, path, body);
    }
    public updateColor(newColor: string, location: Location): Promise<LocationData> {
        const path = this.path + '/' + location._id + '/color';
        const method: Method = 'put';
        const body = { color: newColor };
        return this.api.request(method, path, body);
    }
    public updateSensors(newSensors: Sensor[], location: Location): Promise<LocationData> {
        const path = this.path + '/' + location._id + '/sensors';
        const method: Method = 'put';
        const sensorDesc: Descriptor[] = [];
        for (const sensor of newSensors) {
            sensorDesc.push(sensor.desc);
        }
        const body = { sensorDesc };
        return this.api.request(method, path, body);
    }
    public deleteLocation(location: Location): Promise<LocationData> {
        const path = this.path + '/' + location._id;
        const method: Method = 'delete';
        return this.api.request(method, path, location);
    }
}
