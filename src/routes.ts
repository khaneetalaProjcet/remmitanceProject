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
import { PricesController } from "./controller/prices.controller"




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
{
    method: "get",
    route: "/auth/telotp",
    controller: AuthController,
    action: "getTelegramOtp",
    middlware:[authMiddlewareUser]
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
    method: "get",
    route: "/user/remove/:phone",
    controller: UserController,
    action: "deleteUser",
    middlware:[] 
},
{
    method: "post",
    route: "/user/message",
    controller: UserController,
    action: "sendMessageToUserInTelegram",
    middlware:[]  
},
{
    method: "get",
    route: "/user/addwallet/:phone",
    controller: UserController,
    action: "addWallet",
    middlware:[]  
},

{
    method: "get",
    route: "/user/systemuser",
    controller: UserController,
    action: "createSystemUser",
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
    middlware:[]
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
{
    method: "post",
    route: "/admin/invoice/buyapprove/:id",
    controller: AdminController,
    action: "approveBuyInvoice",
    middlware:[authMiddlewareAdmin] 
},
{
    method: "post",
    route: "/admin/invoice/sellapprove/:id",
    controller: AdminController,
    action: "approveSellInvoice",
    middlware:[authMiddlewareAdmin] 
},
{
    method: "post",
    route: "/admin/invoice/sellreject/:id",
    controller: AdminController,
    action: "rejectSellInvoice",
    middlware:[authMiddlewareAdmin] 
},
{
    method: "post",
    route: "/admin/invoice/buyreject/:id",
    controller: AdminController,
    action: "rejectBuyInvoice",
    middlware:[authMiddlewareAdmin] 
},

{
    method: "get",
    route: "/admin/invoice/all",
    controller: AdminController,
    action: "getAllInvoice",
    middlware:[authMiddlewareAdmin] 
},
{
    method: "get",
    route: "/admin/invoice/foradmin",
    controller: AdminController,
    action: "getAllInvoiceForAdmin",
    middlware:[authMiddlewareAdmin] 
},
{
    method: "get",
    route: "/admin/invoice/foraccounter",
    controller: AdminController,
    action: "getAllInvoiceForAccounter",
    middlware:[authMiddlewareAdmin] 
},
{
    method: "post",
    route: "/admin/invoice/approvepay/:id",
    controller: AdminController,
    action: "approvePaymentBuy",
    middlware:[authMiddlewareAdmin] 
},
{
    method: "post",
    route: "/admin/invoice/rejectpay/:id",
    controller: AdminController,
    action: "rejectPaymentBuy",
    middlware:[authMiddlewareAdmin] 
},
{
    method: "post",
    route: "/admin/invoice/sellpayinfo/:id",
    controller: AdminController,
    action: "getPaymentInfoForSell",
    middlware:[authMiddlewareAdmin] 
},
// {

// },


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
    method: "post",
    route: "/invoice/createnew",
    controller: InvoiceController,
    action: "createNewInvoice",
    middlware:[authMiddlewareUser]
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
{
    method: "post",
    route: "/invoice/pay/:id",
    controller: InvoiceController,
    action: "payBuyApproveRequest",
    middlware:[authMiddlewareUser]
},
{
    method: "get",
    route: "/invoice/cancel/:id",
    controller: InvoiceController,
    action: "cancelBuyRequest",
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
{
    method: "get",
    route: "/appbank/delete/:id",
    controller: bankAccountController,
    action: "deleteAppBankAccount",
    middlware:[authMiddlewareAdmin]
}

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
{
    method: "get",
    route: "/appbank/all",
    controller: bankAccountController,
    action: "getAllBankAccount",
    middlware:[authMiddlewareAdmin]
},
// ? prices
{
    method: "post",
    route: "/prices/set",
    controller: PricesController,
    action: "setGoldPrice",
    middlware:[authMiddlewareAdmin]
},
{
    method: "post",
    route: "/prices/have",
    controller: PricesController,
    action: "updateHaveSellOrBuy",
    middlware:[authMiddlewareAdmin]
},
{
    method: "get",
    route: "/prices/all",
    controller: PricesController,
    action: "getPrices",
    middlware:[]
}








]