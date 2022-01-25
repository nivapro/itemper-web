interface Config {
    development: boolean;
    iTemperAPI: string;
    iTemperWS: string;
}

function configure(): Config {
    const production: boolean = process.env.NODE_ENV === 'production';
    if (!production) {
        return {
            development: !production,
            iTemperAPI: 'http://localhost:3000/',
            iTemperWS: 'ws://localhost:3000/ws',
        };
    } else {
        return {
            development: !production,
            iTemperAPI: 'https://userapi.itemper.io/',
            iTemperWS: 'wss://userapi.itemper.io/ws',
        };
    }

}

export const config = configure();
export const iTemperAPI = config.iTemperAPI;
export const iTemperWS = config.iTemperWS;
