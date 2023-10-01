import Cookies from 'js-cookie';

const TOKEN_COOKIE_NAME = 'jwt';

export const setAuthTokenCookie = (token: string) => {
	Cookies.set(TOKEN_COOKIE_NAME, token, { expires: 30 });
};

export const getAuthTokenFromCookie = () => {
	return Cookies.get(TOKEN_COOKIE_NAME);
};

export const removeAuthTokenCookie = () => {
	Cookies.remove(TOKEN_COOKIE_NAME);
};
