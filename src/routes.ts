import { AdminController } from "./controller/admin.controller"
import {getOtp,login,logout} from "./DTO/auth.dto"
import {setGoldPrice,setGoldPriceFee} from "./DTO/goldPrice.dto"
import {phoneAndNationalAndBirthDate} from "./DTO/shahkar.dto"
import {registerNewAdmin,loginAdmin} from "./DTO/admin.dto"
import { AuthController } from "./controller/auth.controller"
import {ShahkarController} from "./controller/shahkar.controller"
import { GoldPriceController } from "./controller/goldPrice.controller" 
import { UserController } from "./controller/user.controller"
import { InvoiceController } from "./controller/invoice.controller"
import {invoiceBody} from "./DTO/invoice.dto"
import { authMiddlewareAdmin, authMiddlewareUser,authMiddlewareUserRefreshToken } from "./middleware/auth"




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
, {
    method: "get",
    route: "/auth/refresh",
    controller: AuthController,
    action: "refreshTokenCheck",
    middlware:[authMiddlewareUserRefreshToken]
},
, {
    method: "post",
    route: "/auth/logout",
    controller: AuthController,
    action: "logout",
    middlware:[logout]
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

{
    method: "post",
    route: "/fee/gold",
    controller: GoldPriceController,
    action: "setFee",
    middlware:[authMiddlewareAdmin,setGoldPriceFee]
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


/**
 * ?? Invoice Routes
 */
{
    method: "post",
    route: "/invoice/create",
    controller: InvoiceController,
    action: "createInvoice",
    middlware:[authMiddlewareUser,invoiceBody]
},
{
    method: "get",
    route: "/invoice/user",
    controller: InvoiceController,
    action: "getAllInvoiceForUser",
    middlware:[authMiddlewareUser]
}, 

]