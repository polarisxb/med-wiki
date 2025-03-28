// src/utils/api.js
export const XF_CONFIG = {
    APP_ID: 'YOUR_APP_ID', // 替换为实际值
    API_KEY: 'YOUR_API_KEY',
    PLANT_API: 'https://webapi.xfyun.cn/v1/private/s67c9c3c0'
  }
  
  export const generateHeaders = () => {
    const curTime = Math.floor(Date.now() / 1000)
    const param = JSON.stringify({ engine_type: "plant" })
    const paramBase64 = btoa(param)
    const checksum = md5(`${XF_CONFIG.API_KEY}${curTime}${paramBase64}`)
    
    return {
      'X-Appid': XF_CONFIG.APP_ID,
      'X-CurTime': curTime,
      'X-Param': paramBase64,
      'X-CheckSum': checksum
    }
  }