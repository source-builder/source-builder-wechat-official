import 'dotenv/config';
import axios from 'axios';
import { buildURLData } from 'web-utility';

const { WECHET_API: api, WECHET_APPID: appid, WECHET_SECRET: secret } = process.env;

export async function getAccesToken() {
    const result = await axios.get(`${api}/cgi-bin/token?${buildURLData({
        grant_type: 'client_credential',
        appid,
        secret
    })}`)
    return result.data['access_token']
}