

import axios from "./axious.ts";
export const login = (data:any) => {
    return axios({
        url:'/api/auth/login',
        method:'POST',
        data
    })

}