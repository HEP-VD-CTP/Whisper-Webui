import crypto from "node:crypto";

// generate a ordered random unique id of 24 hex characters in uppercase
export function genUID(): string {
  const timestamp = Math.floor(Date.now() / 1000); 
  const randomBytes = crypto.randomBytes(8); 

  const buffer = Buffer.alloc(12);
  buffer.writeUInt32BE(timestamp, 0); 
  randomBytes.copy(buffer, 4); 

  return buffer.toString("hex").toUpperCase();
}

export default {
  genUID
};
