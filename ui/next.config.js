module.exports = {
	serverRuntimeConfig: {
		HOST: process.env.HOST || '0.0.0.0',
		PORT: process.env.PORT || 3000,

		DATABASE_URL: process.env.DATABASE_URL,
		EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST,
		EMAIL_SERVER_PORT: process.env.EMAIL_SERVER_PORT,
		EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER,
		EMAIL_SERVER_PASSWORD: process.env.EMAIL_SERVER_PASSWORD,

		GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
		GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
		GITHUB_ID: process.env.GITHUB_ID,
		GITHUB_SECRET: process.env.GITHUB_SECRET,
		NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
		NEXTAUTH_URL: process.env.NEXTAUTH_URL,
	},
	publicRuntimeConfig: {
		NODE_ENV: process.env.NODE_ENV,
		STATIC_CLOUD_PATH: process.env.STATIC_CLOUD_PATH,
		IMAGE_CLOUD_PATH: process.env.IMAGE_CLOUD_PATH,
		API_URL: process.env.API_URL,
		SOCKET_HOST: process.env.SOCKET_HOST,
		SOCKET_PORT: process.env.SOCKET_PORT,
		SOCKET_URL: process.env.SOCKET_URL,
		SOCKET_PROTOCOL: process.env.SOCKET_PROTOCOL,
		PIXABAY_API_KEY: process.env.PIXABAY_API_KEY
	},

	images: {
		remotePatterns: [
			{
				protocol: process.env.SERVER_PROTOCOL,
				hostname: process.env.SERVER_HOST,
			},
			{
				protocol: 'http',
				hostname: '127.0.0.1',
			},
			{
				protocol: 'https',
				hostname: 'hydeparkwinterwonderland.com',
			},
			{
				protocol: 'https',
				hostname: 'wembleypark.com',
			},
		],
	},

	typescript: {
		ignoreBuildErrors: true,
	},
};
