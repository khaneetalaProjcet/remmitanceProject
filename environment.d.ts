declare global {
    namespace NodeJS {
      interface ProcessEnv {
        DB_HOST: string
        DB_PORT: string
        DB_USER:string
        DB_PASSWORD:string
        DB_NAME:string
        PORT:string,
        JWT_SECRET_KEY_ADMIN: string
        JWT_SECRET_KEY_USER: string ,
        JWT_SECRET_KEY_USER_REFRESH: string ,
        KAVENEGAR_API_KEY:string,
        SHAHKAR_BASE_URL:string,
        IDENTITY_INFO_URL:string,
        AUTH_URL:string,
        TELEGRAM_BOT_TOKEN:string
      }
    }
  }
 
  
  export {};
    