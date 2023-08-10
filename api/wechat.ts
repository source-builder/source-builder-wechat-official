import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import xml2js from 'xml2js';
import { aiChat } from '../common/ChatUtils';

const { WECHET_APPID: token } = process.env;

export default async (request: VercelRequest, response: VercelResponse) => {
  const method = request.method;
  if (method == 'GET') {
    wechatServerCheck(request, response);
  } else if (method == 'POST') {
    const contentType = request.headers['content-type'];
    if (!contentType || !contentType.includes('text/xml')) {
      return response.status(400).end();
    }
    sendMessage(request, response);
  }
}

function wechatServerCheck({ query }: VercelRequest, response: VercelResponse) {
  const echostr = query?.echostr;
  const signature = query?.signature;
  const timestamp = query?.timestamp;
  const nonce = query?.nonce;
  const shasum = crypto.createHash('sha1');
  const arr = [token, timestamp, nonce].sort();
  shasum.update(arr.join(''));

  if (shasum.digest('hex') === signature) {
    response.status(200).send(echostr);
  } else {
    response.status(401).send('Invalid request.');
  }
}

async function sendMessage(request: VercelRequest, response: VercelResponse) {
  const body: string = await new Promise((resolve) => {
    let data = '';
    request.on('data', (chunk) => {
      data += chunk;
    });
    request.on('end', () => {
      resolve(data);
    });
  });

  const xmlParser = new xml2js.Parser();
  xmlParser.parseString(body, async (err, result) => {
    if (err) {
      console.error('XML parsing error:', err);
      return response.status(400).end();
    }
    const message = result.xml;
    if (message.MsgType[0] === 'text') {
      const content = await aiChat(message.FromUserName[0], message.Content[0])
      const result = buildTextResponse(message.FromUserName[0], message.ToUserName[0], content);
      response.status(200).setHeader('content-type', 'text/xml').send(result);
    } else {
      response.status(200).end();
    }
  });
}

function buildTextResponse(toUser: string, fromUser: string, content: string) {
  return `
    <xml>
      <ToUserName><![CDATA[${toUser}]]></ToUserName>
      <FromUserName><![CDATA[${fromUser}]]></FromUserName>
      <CreateTime>${Date.now()}</CreateTime>
      <MsgType><![CDATA[text]]></MsgType>
      <Content><![CDATA[${content}]]></Content>
    </xml>
  `;
}