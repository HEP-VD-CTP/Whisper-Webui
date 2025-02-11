import fs from 'node:fs';

const PATH_INFO_LOG = '/data/backend/backend_info.log';
const PATH_ERROR_LOG = '/data/backend/backend_error.log';

// Create write streams for the log files
const infoStream = fs.createWriteStream(PATH_INFO_LOG, { flags: 'a' });
const errorStream = fs.createWriteStream(PATH_ERROR_LOG, { flags: 'a' });


const getCurrentTime = () => {
  const now = new Date();
  const pad = (num: number) => num.toString().padStart(2, '0');
  const day = pad(now.getDate());
  const month = pad(now.getMonth() + 1);
  const year = now.getFullYear();
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());
  return `${day}.${month}.${year}-${hours}:${minutes}:${seconds}`;
};

export default {
  info: (type: string, message: string) => {
    const msg = {
      time: getCurrentTime(),
      type,
      message
    };
    console.info(msg);
    infoStream.write(JSON.stringify(msg) + '\n');
  },

  error: (type: string, message: string, error: Error) => {
    const msg = {
      time: getCurrentTime(),
      type,
      message,
      error: {
        message: error.toString(),
        stack: error.stack
      }
    };
    console.error(msg);
    errorStream.write(JSON.stringify(msg) + '\n');
  }
} 