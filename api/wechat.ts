import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node'
import crypto from 'crypto';

const { WECHET_SERVER_TOKEN: token } = process.env;

export default (request: VercelRequest, response: VercelResponse) => {
  const echostr = request.query?.echostr;
  const signature = request.query?.signature;
  const timestamp = request.query?.timestamp;
  const nonce = request.query?.nonce;

  const shasum = crypto.createHash('sha1');
  const arr = [token, timestamp, nonce].sort();
  shasum.update(arr.join(''));

  if (shasum.digest('hex') === signature) {
    response.status(200).send(echostr);
  } else {
    response.status(401).send('Invalid request.');
  }
}
