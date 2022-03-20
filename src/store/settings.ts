import { Category } from '@/models/sensor-data';

export class Settings {
    private mResolution = 1;
    private mUnitSymbol = '°C';
    private mLimit = 30;
    private mInterval = 60;
    private mZone= 'Europe/Stockholm';
    private mDecimalComma = true;

    get resolution(): number {
        return this.mResolution;
    }

    set resolution(value: number) {
        this.mResolution = value;
    }

    public unit(category: Category): string {
        switch (category) {
            case Category.Temperature:
                return '°C';
            case Category.Humidity:
                return '%';
            case Category.AirPressure:
                return 'hPA';
        }
        return '';
    }
    public unitFactor(category: Category): number {
        switch (category) {
            case Category.AirPressure:
                return 0.01;
        }
        return 1;
    }
    set setUnit(value: string) {
        this.mUnitSymbol = value;
    }
    get limit(): number {
        return this.mLimit;
    }

    set limit(value: number) {
        this.mLimit = value;
    }

    get interval(): number {
        return this.mInterval;
    }

    set interval(value: number) {
        this.mInterval = value;
    }

    get zone(): string {
        return this.mZone;
    }

    set zone(value: string) {
        this.mZone = value;
    }

    get decimalComma(): boolean {
        return this.mDecimalComma;
    }

    set decimalComma(value: boolean) {
        this.mDecimalComma = value;
    }
}

