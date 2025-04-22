import { AdminController } from "./controller/admin.controller"
import {approve, getOtp,login,logout} from "./DTO/auth.dto"
import {setGoldPrice,setGoldPriceFee} from "./DTO/goldPrice.dto"
import {phoneAndNationalAndBirthDate} from "./DTO/shahkar.dto"
import {registerNewAdmin,loginAdmin} from "./DTO/admin.dto"
import { AuthController } from "./controller/auth.controller"
import {ShahkarController} from "./controller/shahkar.controller"
import { GoldPriceController } from "./controller/goldPrice.controller" 
import { UserController } from "./controller/user.controller"
import { InvoiceController } from "./controller/invoice.controller"
import {invoiceBody} from "./DTO/invoice.dto"
import {SettingController} from "./controller/setting.controller" 
import {CreateAppBankAccount,CreateBankAccount} from "./DTO/bankAccount.dto"
import { authMiddlewareAdmin, authMiddlewareUser,authMiddlewareUserRefreshToken } from "./middleware/auth"
import { bankAccountController } from "./controller/bankAccount.controller"




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

{
    method: "post",
    route: "/auth/approve",
    controller: AuthController,
    action: "approveRequest",
    middlware:[authMiddlewareUser,approve]
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
{
    method: "post",
    route: "/user/message",
    controller: UserController,
    action: "sendMessageToUserInTelegram",
    middlware:[]  
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
    middlware:[authMiddlewareAdmin]
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
{
    method: "get",
    route: "/admin/authrequest",
    controller: AdminController,
    action: "getApproveRequest",
    middlware:[authMiddlewareAdmin] 
},
{
    method: "get",
    route: "/admin/users",
    controller: AdminController,
    action: "getAllUser",
    middlware:[authMiddlewareAdmin] 
},
{
    method: "get",
    route: "/admin/approve/:id",
    controller: AdminController,
    action: "approveUser",
    middlware:[authMiddlewareAdmin] 
},
{
    method: "get",
    route: "/admin/reject/:id",
    controller: AdminController,
    action: "rejectUser",
    middlware:[authMiddlewareAdmin] 
},
{
    method: "get",
    route: "/admin/admins",
    controller: AdminController,
    action: "getAllAdmins",
    middlware:[authMiddlewareAdmin] 
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
}, {
    method: "get",
    route: "/invoice/user/:id",
    controller: InvoiceController,
    action: "getOneInvoice",
    middlware:[authMiddlewareUser]
},
{
    method: "post",
    route: "/invoice/filter",
    controller: InvoiceController,
    action: "getAllInvoiceForUserFilter",
    middlware:[authMiddlewareUser]
},

/**
 * ?? Setting Routes
 */
{
    method: "post",
    route: "/setting/change",
    controller: SettingController,
    action: "updateSetting",
    middlware:[authMiddlewareAdmin]
},
{
    method: "get",
    route: "/setting",
    controller: SettingController,
    action: "getSetting",
    middlware:[]
},
/**
 * ?? Bank Account Routes
 */

{
    method: "post",
    route: "/bank/create",
    controller: bankAccountController,
    action: "createBankAccount",
    middlware:[authMiddlewareUser,CreateBankAccount]
},{
    method: "post",
    route: "/appbank/create",
    controller: bankAccountController,
    action: "createAppBankAccount",
    middlware:[authMiddlewareAdmin,CreateAppBankAccount]
},
,{
    method: "get",
    route: "/bank/active/:id",
    controller: bankAccountController,
    action: "activeBankAccount",
    middlware:[authMiddlewareUser]
},
,{
    method: "get",
    route: "/bank/delete/:id",
    controller: bankAccountController,
    action: "deleteBankAccount",
    middlware:[authMiddlewareUser]
},






]