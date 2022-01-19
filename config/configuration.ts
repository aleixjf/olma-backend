export function configuration() {
  return {
    environment: process.env.NODE_ENV ? process.env.NODE_ENV : 'production',
    app: {
      url: process.env.APP_URL.startsWith('http://')
        ? process.env.APP_URL
        : `http://${process.env.APP_URL}`,
      api: process.env.APP_API,
      port: parseInt(process.env.PORT, 10) || 3000,
    },
    token: {
      secret: process.env.APP_SECRET_KEY,
      short_lived: process.env.SHORT_LIVED_TOKEN_EXPIRATION,
      long_lived: process.env.LONG_LIVED_TOKEN_EXPIRATION,
    },
    database: {
      type: process.env.DB_TYPE,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      name: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
    dropbox: {
      client: process.env.DROPBOX_CLIENT,
      secret: process.env.DROPBOX_SECRET,
    },
    microsoft: {
      client: process.env.MICROSOFT_CLIENT,
      secret: process.env.MICROSOFT_SECRET,
    },
    spotify: {
      client: process.env.SPOTIFY_CLIENT,
      secret: process.env.SPOTIFY_SECRET,
    },
  };
}
