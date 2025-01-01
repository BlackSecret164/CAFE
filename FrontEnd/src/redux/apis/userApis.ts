import { AxiosRequestConfig } from "axios";
import MainApiRequest from "./MainApiRequest"

export const userApis = {
    login: function* ({ username, password }: { username: string, password: string }): any {
        const config: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${authorization}`,
            },
        }
        return yield MainApiRequest.post(`/auth/signin`, { username, password }, config)
    }
};