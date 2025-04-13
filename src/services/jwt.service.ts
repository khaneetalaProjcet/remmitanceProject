import jwt from 'jsonwebtoken'
import { jwtGeneratorInterfaceAdmin,jwtGeneratorInterfaceUser } from '../interface/interfaces.interface'



 export class JwtGenerator{

    async tokenizeAdminToken(data:jwtGeneratorInterfaceAdmin){
        return jwt.sign(data , process.env.JWT_SECRET_KEY_Admin , {'expiresIn' : '1H'})
    }

    async tokenizeUserToken(data:jwtGeneratorInterfaceUser){
        return jwt.sign(data ,process.env.JWT_SECRET_KEY_User, {'expiresIn' : '1H'})
    }

}