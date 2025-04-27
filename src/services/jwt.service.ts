import jwt from 'jsonwebtoken'
import { jwtGeneratorInterfaceAdmin,jwtGeneratorInterfaceUser } from '../interface/interfaces.interface'



 export class JwtGenerator{

    async tokenizeAdminToken(data:jwtGeneratorInterfaceAdmin){
        return jwt.sign(data , process.env.JWT_SECRET_KEY_ADMIN || "69b9381954141365ff7be95516f16c252edcb37eb39c7a42eaaf6184d93bccb2cscavdfvsdvsdv" , {'expiresIn' : '1h'})
    }

    async tokenizeUserToken(data:jwtGeneratorInterfaceUser){
        return jwt.sign(data ,process.env.JWT_SECRET_KEY_USER||"69b9381954141365ff7be95516f16c252edcb37eb39c7a42eaaf6184d93bccb2cscavdfvsdvsdvcsacvdc", {'expiresIn' : '2m'})
    }

    async tokenizeUserRefreshToken(data:jwtGeneratorInterfaceUser){
        return jwt.sign(data ,process.env.JWT_SECRET_KEY_USER_REFRESH || "69b9381954141365ff7be95516f16c252edcb37eb39c7a42eaaf6184d93bccb2cscavdfvsdvsdvcsacvdcsacascsacv12432r", {'expiresIn' : '1h'})
    }

}