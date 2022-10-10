import { getExtendedLogger } from "../../log";

const axios = require("axios");

export function main(url: string) {
    return new Promise(function (resolve, reject) {
        const rid: any = url.match(/(?<=\/)\d{2,}/g);
        axios
            .get(
                `https://api.live.bilibili.com/room/v1/Room/room_init?id=${rid}`
            )
            .then(function (response: any) {
                //{"code":0,"msg":"ok","message":"ok","data":{"room_id":4195167,"short_id":0,"uid":2990100,"need_p2p":0,"is_hidden":false,"is_locked":false,"is_portrait":false,"live_status":0,"hidden_till":0,"lock_till":0,"encrypted":false,"pwd_verified":false,"live_time":-62170012800,"room_shield":0,"is_sp":0,"special_type":0}}
                const data: any = response.data;
                if (data["code"] != 0 || data["data"]["live_time"] < 0) {
                    reject(
                        "BILIBILI=>No match results:Maybe the roomid is error,or this room is not open!"
                    );
                }
                const real_id: string = data["data"]["room_id"];
                const config: any = {
                    method: "get",
                    url: `https://api.live.bilibili.com/xlive/web-room/v1/playUrl/playUrl?cid=${real_id}&platform=h5&qn=10000`,
                    headers: {
                        "Content-Type": "application/json; charset=utf-8",
                    },
                };

                //{"code":0,"message":"0","ttl":1,"data":{"current_qn":10000,"quality_description":[{"qn":10000,"desc":"原画"}],"durl":[{"url":"https://cn-gddg-ct-01-23.bilivideo.com/live-bvc/650365/live_2990100_1455625.m3u8?expires=1665418144\u0026len=0\u0026oi=605766516\u0026pt=h5\u0026qn=10000\u0026trid=10032219bf0dfe5a4cc09a466bb17fe686d9\u0026sigparams=cdn,expires,len,oi,pt,qn,trid\u0026cdn=cn-gotcha01\u0026sign=797c8a6f3748161c11e432b4980dbcff\u0026sk=2935686d6cb9146c7a6a6a0b4e120e250342be3df4dc8310261aab0ce9e21e44\u0026p2p_type=0\u0026src=57345\u0026sl=2\u0026free_type=0\u0026sid=cn-gddg-ct-01-23\u0026chash=0\u0026sche=ban\u0026score=14\u0026pp=rtmp\u0026source=one\u0026site=f4f271d044ae53424ee4871aeff4c45c\u0026order=1","length":0,"order":1,"stream_type":0,"ptag":0,"p2p_type":0}],"is_dash_auto":false}}
                axios(config).then(function (response: any) {
                    const html: any = response.data;
                    getExtendedLogger("bilibili").trace(`获取哔哩哔哩房间 ${rid} 的推流信息 ${JSON.stringify(html, null, 2)}`)
                    const links: any = html["data"]["durl"];
                    let m3u8_url = links[0]["url"];
                    resolve(m3u8_url);
                });
            })
            .catch(function (error: any) {
                reject(error);
            });
    });
}
