interface Config {
    development: boolean;
    iTemperAPI: string;
    iTemperWS: string;
    defaultUser?: string;
    password: string;
}

function configure(): Config {
    const production: boolean = process.env.NODE_ENV === 'production';
    if (!production) {
        return {
            development: !production,
            iTemperAPI: process.env.VUE_APP_iTEMPER_API || 'http://localhost:3000/',
            iTemperWS: process.env.VUE_APP_iTEMPER_API_WS || 'ws://localhost:3000/ws',
            defaultUser: process.env.VUE_APP_iTEMPER_USER,
            password: process.env.VUE_APP_iTEMPER_PASSWORD || '',
        };
    } else {
        return {
            development: !production,
            iTemperAPI: process.env.VUE_APP_iTEMPER_API || 'https://userapi.itemper.io/',
            iTemperWS: process.env.VUE_APP_iTEMPER_API_WS || 'wss://userapi.itemper.io/ws',
            defaultUser: process.env.VUE_APP_iTEMPER_USER,
            password: process.env.VUE_APP_iTEMPER_PASSWORD || '',
        };
    }

}

export const config = configure();
export const iTemperAPI = config.iTemperAPI;
export const iTemperWS = config.iTemperWS;
