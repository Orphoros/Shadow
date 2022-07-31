import debug from 'debug';

export const appLog = debug('APP');
export const errorLog = appLog.extend('ERROR');
export const handlerLog = appLog.extend('HANDLER');
export const eventLog = handlerLog.extend('EVENT');
export const bootLog = appLog.extend('BOOT');
export const bootEventLog = bootLog.extend('EVENT');
export const commandLog = handlerLog.extend('COMMAND');
export const bootCommandLog = bootLog.extend('COMMAND');
export const dbgLog = appLog.extend('LOG');
