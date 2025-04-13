import { AdminController } from "./controller/admin.controller"
import {getOtp,login} from "./DTO/auth.dto"
import {phoneAndNationalAndBirthDate} from "./DTO/shahkar.dto"
import { AuthController } from "./controller/auth.controller"
import {ShahkarController} from "./controller/shahkar.controller"
import { UserController } from "./controller/user.controller"
import { authMiddlewareAdmin, authMiddlewareUser } from "./middleware/auth"


export const Routes = [{
    method: "post",
    route: "/auth/otp",
    controller: AuthController,
    action: "sendOtpMessage",
    middlware:[getOtp]
}, {
    method: "post",
    route: "/auth/login",
    controller: AuthController,
    action: "loginUser",
    middlware:[login]
},
{
    method: "post",
    route: "/user/identity",
    controller: ShahkarController,
    action: "matchPhoneAndNationalCodeAndGetIdentity",
    middlware:[phoneAndNationalAndBirthDate,authMiddlewareUser]
},
{
    method: "get",
    route: "/user/profile",
    controller: UserController,
    action: "profile",
    middlware:[authMiddlewareUser]
},
          

]