

import axios from "./axious.ts";
export const getRoleInfoPage = (data:any) => {
    return axios({
        url:'/api/role/getRoleInfoPage',
        method:'POST',
        data
    })
}