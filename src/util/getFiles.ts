import fs, { Dirent } from 'fs';
import path from 'path';
import { errorLog } from './dbg';

const getFiles = (dir: string, suffix: string): string[] => {
  try {
    const files: Dirent[] = fs.readdirSync(dir, {
      withFileTypes: true,
    });
    let commandFiles: string[] = [];

    for (const file of files) {
      if (file.isDirectory()) {
        commandFiles = [
          ...commandFiles,
          ...getFiles(`${dir}/${file.name}`, suffix),
        ];
      } else if (file.name.endsWith(suffix)) {
        commandFiles.push(`${path.resolve(dir)}/${file.name}`);
      }
    }
    return commandFiles;
  } catch (e) {
    errorLog('Cannot read in files: %O', e);
    return [];
  }
};

export default getFiles;
