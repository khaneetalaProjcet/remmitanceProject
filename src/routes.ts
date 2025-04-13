import { AdminController } from "./controller/admin.controller"
import {getOtp,login} from "./DTO/auth.dto"
import {setGoldPrice} from "./DTO/goldPrice.dto"
import {phoneAndNationalAndBirthDate} from "./DTO/shahkar.dto"
import {registerNewAdmin,loginAdmin} from "./DTO/admin.dto"
import { AuthController } from "./controller/auth.controller"
import {ShahkarController} from "./controller/shahkar.controller"
import { GoldPriceController } from "./controller/goldPrice.controller" 
import { UserController } from "./controller/user.controller"
import { authMiddlewareAdmin, authMiddlewareUser } from "./middleware/auth"




export const Routes = [
    /**
     * ?? Auth Routes
     */
    
    {
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

/**
 * ?? User Routes
 */

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

/**
 * ?? GoldPrice Routes
 */


{
    method: "get",
    route: "/price/gold",
    controller: GoldPriceController,
    action: "getGoldPrice",
    middlware:[]
},
{
    method: "post",
    route: "/price/gold",
    controller: GoldPriceController,
    action: "setGoldPrice",
    middlware:[authMiddlewareAdmin,setGoldPrice]
},



/**
 * ?? Admin Routes
 */

{
    method: "post",
    route: "/admin/register",
    controller: AdminController,
    action: "registerAdmin",
    middlware:[authMiddlewareAdmin,registerNewAdmin]
},
{
    method: "post",
    route: "/admin/login",
    controller: AdminController,
    action: "loginAdmin",
    middlware:[loginAdmin]
},
          

]