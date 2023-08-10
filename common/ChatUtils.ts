import axios from 'axios';
import 'dotenv/config';

const { BOT_API: api, BOT_TOKEN: token } = process.env;

export async function sign(userid: string) {
    const { data } = await axios.post(`${api}/openapi/sign/${token}`, {
        userid
    })
    return data['signature']
}

export async function aiChat(userid: string, query: string) {
    const { data } = await axios.post(`${api}/openapi/aibot/${token}`, {
        signature: await sign(userid),
        query,
    })
    return data['msg'][0]['content']
}