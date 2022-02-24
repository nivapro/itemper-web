import { config } from '@/config';
import util from 'util';
enum Level { Debug, Info, Error }
class Debug {
  private logging: boolean = config.development;
  private m: string;
  constructor(m: string) {
    this.m = m;
  }
  public debug(str: string, ...args: unknown[]) {
    this.log(Level.Debug, str, ...args);
  }
  public info(str: string, ...args: unknown[]) {
    this.log(Level.Info, str, ...args);
  }
  public error(str: string, ...args: unknown[]) {
    this.log(Level.Error, str, ...args);
  }
  public log(level: Level, str: string, ...args: unknown[]) {
    const msg = util.format(str, ...args);
    if (this.logging) {
        console.log(Level[level] + ' ' + new Date().toISOString() + ' ' + this.m + ' ' + msg);
    }
  }
  public startLogging(): void {
    this.logging = true;
    this.debug('debug.startLogging');
    this.setTimer();
  }

  public stopLogging(): void {
    this.debug('debug.stopLogging');
    this.logging = false;
  }
  private reset(): void {
    this.debug('debug.reset');
    this.logging = config.development;
  }

  private setTimer() {
    const timeout = 5 * 60_000;
    setTimeout(() => {this.reset(); }, timeout);
  }

}

export const log = new Debug('[iTemper-web]');
