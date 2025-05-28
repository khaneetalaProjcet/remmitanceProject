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
import { accessPointController } from "./controller/accessPoint.controller"
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
{
    method: "post",
    route: "/auth/testsms",
    controller: AuthController,
    action: "sendSmsTest",
    middlware:[]
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
    route: "/user/deliver",
    controller: UserController,
    action: "deliverRequest",
    middlware:[authMiddlewareUser]
},
{
    method: "get",
    route: "/user/deliver",
    controller: UserController,
    action: "getdeliverRequest",
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
{
    method: "get",
    route: "/user/delwallet",
    controller: UserController,
    action: "deleteUSerWallrt",
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
    middlware:[registerNewAdmin,authMiddlewareAdmin]
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
    route: "/admin/check",
    controller: AdminController,
    action: "checkToken",
    middlware:[authMiddlewareAdmin] 
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
    route: "/admin/remove/:id",
    controller: AdminController,
    action: "removeAdmin",
    middlware:[authMiddlewareAdmin] 
},
{
    method: "get",
    route: "/admin/deactive/:id",
    controller: AdminController,
    action: "inActiveAdmin",
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
    method: "get",
    route: "/admin/invoice/skipa/:id",
    controller: AdminController,
    action: "skip",
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
{
    method: "post",
    route: "/admin/invoice/paydone/:id",
    controller: AdminController,
    action: "sellPaymentDone",
    middlware:[authMiddlewareAdmin] 
},
{
    method: "post",
    route: "/admin/invoice/paycancel/:id",
    controller: AdminController,
    action: "sellPaymentCancel",
    middlware:[authMiddlewareAdmin] 
},
{
    method: "get",
    route: "/admin/invoice/deliver",
    controller: AdminController,
    action: "getDeliverOrder",
    middlware:[authMiddlewareAdmin] 
},
{
    method: "post",
    route: "/admin/invoice/deliver/:id",
    controller: AdminController,
    action: "delivery",
    middlware:[authMiddlewareAdmin] 
},
{
    method: "post",
    route: "/admin/invoice/getauthority/:id",
    controller: AdminController,
    action: "paymnetBuyInfoByAccounter",
    middlware:[authMiddlewareAdmin] 
},
{
    method: "post",
    route: "/admin/invoice/selldeliver/:id",
    controller: AdminController,
    action: "sellDelivery",
    middlware:[authMiddlewareAdmin] 
},
{
    method: "post",
    route: "/admin/invoice/approvecoin/:id",
    controller: AdminController,
    action: "coninApprovePaymentBuy",
    middlware:[authMiddlewareAdmin] 
},
{
    method: "post",
    route: "/admin/invoice/delivercoin/:id",
    controller: AdminController,
    action: "coinDelivery",
    middlware:[authMiddlewareAdmin] 
},
{
    method: "post",
    route: "/admin/invoice/selldelivercoin/:id",
    controller: AdminController,
    action: "coinSellDelivery",
    middlware:[authMiddlewareAdmin] 
},
{
    method: "post",
    route: "/admin/deliver/approvedelivery/:id",
    controller: AdminController,
    action: "approveDeliveryRequest",
    middlware:[authMiddlewareAdmin]  
},
{
    method: "post",
    route: "/admin/deliver/rejectdelivery/:id",
    controller: AdminController,
    action: "rejectDeliveryRequest",
    middlware:[authMiddlewareAdmin] 
},
{
    method: "get",
    route: "/admin/deliver/deliver",
    controller: AdminController,
    action: "getAllDeliveryRequest",
    middlware:[authMiddlewareAdmin] 
},
{
    method: "get",
    route: "/admin/chart/carts",
    controller: AdminController,
    action: "cartChart",
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
, {
    method: "get",
    route: "/invoice/rejecttime/:id",
    controller: InvoiceController,
    action: "rejectInTime",
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
{
    method: "get",
    route: "/setting/sellmax",
    controller: SettingController,
    action: "updateHaveSellMax",
    middlware:[authMiddlewareAdmin]
},
{
    method: "get",
    route: "/setting/buymax",
    controller: SettingController,
    action: "updateHaveBuyMax",
    middlware:[authMiddlewareAdmin]
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
    method: "post",
    route: "/prices/maxmin/:id",
    controller: PricesController,
    action: "updateMaxSellOrBuy",
    middlware:[authMiddlewareAdmin]
},
{
    method: "get",
    route: "/prices/all",
    controller: PricesController,
    action: "getPrices",
    middlware:[]
},

//? access Point Sectiobn

{
    method: "post",
    route: "/access/create",
    controller: accessPointController,
    action: "createParnetAccessPoint",
    middlware:[authMiddlewareAdmin]
},
{
    method: "post",
    route: "/access/createchild",
    controller: accessPointController,
    action: "createChildAccessPoint",
    middlware:[authMiddlewareAdmin]
},
{
    method: "get",
    route: "/access/all",
    controller: accessPointController,
    action: "getAllAccessPoints",
    middlware:[authMiddlewareAdmin]
},
{
    method: "post",
    route: "/access/admin",
    controller: accessPointController,
    action: "updateAdminAccessPoint",
    middlware:[authMiddlewareAdmin]
},

{
    method: "get",
    route: "/access/admin/:id",
    controller: accessPointController,
    action: "getAdminAccessPoint",
    middlware:[authMiddlewareAdmin]
}






]