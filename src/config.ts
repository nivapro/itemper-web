interface Config {
    development: boolean;
    iTemperAPI: string;
    iTemperWS: string;
    version: string;
    date: string;
}

function configure(): Config {
    const production: boolean = process.env.NODE_ENV === 'production';
    if (!production) {
        return {
            development: !production,
            iTemperAPI: process.env.VUE_APP_iTEMPER_API || 'http://localhost:3000/',
            iTemperWS: process.env.VUE_APP_iTEMPER_API_WS || 'ws://localhost:3000/ws',
            version: process.env.VUE_APP_VERSION || '-' ,
            date: process.env.VUE_APP_BUILD_DATE || '-',
        };
    } else {
        return {
            development: !production,
            iTemperAPI: process.env.VUE_APP_iTEMPER_API || 'https://userapi.itemper.io/',
            iTemperWS: process.env.VUE_APP_iTEMPER_API_WS || 'wss://userapi.itemper.io/ws',
            version: process.env.VUE_APP_VERSION || '-' ,
            date: process.env.VUE_APP_BUILD_DATE || '-',
        };
    }

}

export const config = configure();
export const iTemperAPI = config.iTemperAPI;
export const iTemperWS = config.iTemperWS;
