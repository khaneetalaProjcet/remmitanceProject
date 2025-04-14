import jwt from 'jsonwebtoken'
import { jwtGeneratorInterfaceAdmin,jwtGeneratorInterfaceUser } from '../interface/interfaces.interface'



 export class JwtGenerator{

    async tokenizeAdminToken(data:jwtGeneratorInterfaceAdmin){
        return jwt.sign(data , process.env.JWT_SECRET_KEY_ADMIN , {'expiresIn' : '1H'})
    }

    async tokenizeUserToken(data:jwtGeneratorInterfaceUser){
        return jwt.sign(data ,process.env.JWT_SECRET_KEY_USER, {'expiresIn' : '2m'})
    }

    async tokenizeUserRefreshToken(data:jwtGeneratorInterfaceUser){
        return jwt.sign(data ,process.env.JWT_SECRET_KEY_USER_REFRESH, {'expiresIn' : '1H'})
    }

}