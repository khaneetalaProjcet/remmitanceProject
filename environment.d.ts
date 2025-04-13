declare global {
    namespace NodeJS {
      interface ProcessEnv {
        DB_HOST: string
        DB_PORT: string
        DB_USER:string
        DB_PASSWORD:string
        DB_NAME:string
        PORT:string,
        JWT_SECRET_KEY_Admin: string
        JWT_SECRET_KEY_User: string ,
        KAVENEGAR_API_KEY:string,
        SHAHKAR_BASE_URL:string,
        IDENTITY_INFO_URL:string,
        AUTH_URL:string
      }
    }
  }
 
  
  export {};
    