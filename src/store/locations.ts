import { Location } from '@/features/locations';
import { Sensor } from '@/models/sensor';
import { store } from '@/store/store';
import { LocationData, ILocationService } from '@/features/locations/';

import { Vue  } from 'vue-property-decorator';

import { log } from '@/services/logger';

interface  ErrorMessage {
    response?: {data: string}
    request?: unknown;
    message?: string
}
export class Locations {
    private mLocations: Location[] = [];
    private mError = '';

    constructor(private locationService: ILocationService) {
    }
    public reset(): void {
        this.mError = '';
        this.mLocations = [];
    }
    public get all(): Location[] {
        return this.mLocations;
    }
    public set all(value: Location[]) {
       Vue.set(this, 'mLocations', value);
    }
    public get error(): string {
        return this.mError;
    }
    public set error(value: string) {
       Vue.set(this, 'mError', value);
    }
    public getLocations(): Promise<void> {
        return new Promise((resolve, reject) => {
            log.debug('Locations.getLocations');
            this.resetError();
            this.locationService.getLocations()
            .then((received: LocationData[]) => {
                log.debug('getLocations.received=' + JSON.stringify(received));
                received.forEach((locationData) => {
                    const found = this.all.find((l) => l._id === locationData._id);
                    if (found) {
                        this.mapSensorDesc(found, locationData);
                    } else {
                        const newLocation = this.newLocation(locationData);
                        this.mapSensorDesc(newLocation, locationData);
                        this.all.push(newLocation);
                    }
                });
                resolve();
            })
            .catch((e) => {
                log.debug('ERROR getLocations.catch error=' + e);
                this.handleError(e);
                reject(e);
            });
        });

    }
    public createLocation(form: FormData): Promise<Location> {
        this.resetError();
        return new Promise ((resolve, reject) => {
            this.locationService.createLocation(form)
            .then((received: LocationData) => {
                const newLocation = this.newLocation(received);
                this.mLocations.push(newLocation);
                log.debug('locations.createLocation=' + JSON.stringify(newLocation));
                resolve(newLocation);
            })
            .catch((e) => reject(e));
        });
    }

    public deleteLocation(location: Location): Promise<Location | undefined> {
        this.resetError();
        return new Promise ((resolve, reject) => {
            this.locationService.deleteLocation(location)
            .then((received: LocationData) => {
                const index = this.mLocations.findIndex((l) => l.mId === received._id);
                if (index >= 0 ) {
                    const deleted = this.mLocations[index];
                    this.mLocations.splice(index, 1);
                    resolve(deleted);
                } else {
                    resolve(undefined);
                }
            })
            .catch((e) => reject(e));
        });
    }

    public updateFile(form: FormData, location: Location): Promise<Location> {
        this.resetError();
        return new Promise ((resolve, reject) => {
            this.locationService.updateFile(form, location)
            .then((received: LocationData) => {
                const thisLocation = this.mLocations.find((l) => l._id === received._id);
                if (!thisLocation) {
                    reject({status: 96, message: 'location id not available'});
                } else {
                    location.path = received.path;
                    resolve(location);
                }
            })
            .catch((e) => reject(e));
        });
    }

    public updateName(newName: string, location: Location): Promise<Location> {
        this.resetError();
        return new Promise ((resolve, reject) => {
            this.locationService.updateName(newName, location)
            .then((received: LocationData) => {
                const thisLocation = this.mLocations.find((l) => l._id === received._id);
                if (!thisLocation) {
                    reject({status: 96, message: 'location id not available'});
                } else {
                    location.name = received.name;
                    resolve(location);
                }
            })
            .catch((e) => reject(e));
        });
    }
    public updateColor(newColor: string, location: Location): Promise<Location> {
        this.resetError();
        return new Promise ((resolve, reject) => {
            this.locationService.updateColor(newColor, location)
            .then((received: LocationData) => {
                const thisLocation = this.mLocations.find((l) => l._id === received._id);
                if (!thisLocation) {
                    reject({status: 96, message: 'location id not available'});
                } else {
                    location.color = received.color;
                    resolve(location);
                }
            })
            .catch((e) => reject(e));
        });
    }
    public updateSensors(newSensors: Sensor[], location: Location): Promise<Location> {
        this.resetError();
        log.debug('locations.updateSensors ' + JSON.stringify(newSensors));
        return new Promise ((resolve, reject) => {
            this.locationService.updateSensors(newSensors, location)
            .then((received: LocationData) => {
                const thisLocation = this.all.find((l) => l._id === received._id);
                if (!thisLocation) {
                    reject({status: 96, message: 'location id not available'});
                } else {
                    thisLocation.sensorDesc = received.sensorDesc;
                    log.debug('locations.updateSensors.mapSensorDesc');
                    this.mapSensorDesc(thisLocation, received);
                    resolve(thisLocation);
                }
            })
            .catch((e) => reject(e));
        });
    }
    public locationOf(id: string): Location | undefined {
        return this.all.find((l) => l._id === id);

    }
    private newLocation(response: LocationData): Location {
        const location = new Location (response.name, response.color);
        location._id = response._id;
        response.path ? location.path = response.path : response.path = '';
        response.sensorDesc ? location.sensorDesc = response.sensorDesc : response.sensorDesc = [];
        return location;
    }
    private mapSensorDesc(location: Location, locationData: LocationData) {
        const m = 'locations.mapSensorDesc: ';
        location.sensors = [];
        for (const desc of locationData.sensorDesc) {
            const found = location.sensors.find((s) => s.desc.SN === desc.SN && s.desc.port === desc.port);
            if (!found) {
                const inStoreSensor = store.sensors.find(desc);
                if (inStoreSensor) {
                    location.sensors.push(inStoreSensor);
                } else {
                    log.error(m + 'Sensor noy found, removed from location ' + JSON.stringify(desc));
                }
            } else {
                log.info(m + 'Sensor mapped to location already ' + JSON.stringify(desc));
            }
        }
        store.sensors.setLocation(location);
    }
    private resetError() {
        this.mError = '';
    }
    private handleError(e: ErrorMessage ) {
        if (e.response) {
            this.mError = e.response.data;
        } else if (e.request) {
            this.mError = 'No response from server';
        } else if (e.message) {
            this.mError = e.message;
        } else {
            this.mError = 'Something went wrong';
        }
        setTimeout(this.resetError, 1000 * 5);
    }
}

