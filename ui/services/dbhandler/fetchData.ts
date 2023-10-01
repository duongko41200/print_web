import axios from "axios";
import { getAuthTokenFromCookie } from "utils/cookie";

export async function fetchAuthData(
	url: string,
	method: string,
	data?: any,
	onSuccess?: (data: any) => void,
	onError?: (err: any) => void
) {
	try {
		let res:any;
		const authToken = getAuthTokenFromCookie();

		if (method === 'get' || method === 'delete'){
			res = await axios[method](url, {
				headers: {
					Authorization: `Bearer ${authToken}`,
				},
				params: data
			});
			
		} else {
			res = await axios[method](url, data, {
				headers: {
					Authorization: `Bearer ${authToken}`,
				},
			});
		}

		if (res.data.status === 'success') {
			onSuccess && onSuccess(res.data);
			return res.data.data;
		}

		return null;
	} catch (err) {
		console.log(err);
		onError && onError(err);
	}
}
