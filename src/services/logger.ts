import * as winston from 'winston';
const transports = {
//    file: new winston.transports.File({ filename: 'itemper-vue-error.log', level: 'error' }),
    console: new (winston.transports.Console)(),
};

export const log =  new winston.Logger({
    exitOnError: false,
    level: 'info',
    transports: [
  //      transports.file,
        transports.console,
    ],
  });

export function setLevel(level: string): void {
    log.transports.console.level = level;
}
  // let v: winston.LoggerOptions;
// if we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
// if (process.env.NODE_ENV !== 'production') {
// logger.add(new winston.transports.Console({
//     format: winston.configure({

//     })
// }));
// }
export default log;
