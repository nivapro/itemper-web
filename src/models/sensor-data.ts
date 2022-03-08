
export enum Category {
    Temperature = 'Temperature',
    AbsoluteHumidity = 'AbsoluteHumidity',
    RelativeHumidity = 'RelativeHumidity',
    WindSpeed = 'WindSpeed',
    rssi = 'rssi',
    Humidity = 'Humidity',
    AirPressure = 'AirPressure',
    AccelerationX = 'AccelerationX',
    AccelerationY = 'AccelerationY',
    AccelerationZ = 'AccelerationZ',
    Battery = 'Battery',
    TxPower = 'TxPower',
    MovementCounter = 'MovementCounter',
    Other = 'Other',
}
export interface Sample {
    value: number;
    date: number;
}
export interface Attributes {
    model: string;
    category: Category;
    accuracy: number;
    resolution: number;
    maxSampleRate: number;
}

export interface Descriptor {
    SN: string;
    port: number;
}
export interface SensorLog {
    desc: Descriptor;
    samples: Sample[];
}
export interface SensorData {
    _id: string;
   deviceID: string;
   desc: Descriptor;
   attr: Attributes;
   samples: Sample[];
}

export interface ISensorDesc {
    desc: Descriptor;
}
