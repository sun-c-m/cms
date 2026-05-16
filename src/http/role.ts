

import axios from "./axious.ts";
export const getRoleInfoPage = (data:any) => {
    return axios({
        url:'/api/role/getRoleInfoPage',
        method:'POST',
        data
    })
}
export const deleteRole = (id: number) => {
    return axios({
        url: `/api/role/${id}`,
        method: 'DELETE'
    })
}