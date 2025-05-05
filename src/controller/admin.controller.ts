import { AppDataSource } from "../data-source";
import { Request, Response,NextFunction } from "express";
import {jwtGeneratorInterfaceAdmin} from "../interface/interfaces.interface"
import {JwtGenerator} from  "../services/jwt.service"
import { Admin } from "../entity/Admin";
import { Invoice } from "../entity/Invoice";
import {User} from "../entity/User"
import {accessPoint} from "../entity/accessPoint"
import { responseModel } from "../utills/response.model";
import bcrypt from 'bcrypt'
import { AppBankAccount } from "../entity/AppBankAccount";
import {  validationResult } from "express-validator";
import { TelegramUser } from "../entity/TelegramUser";
import TelegramBot from 'node-telegram-bot-api';
import { showMainMenu } from "../services/telegramBot/menu";
import {WalletTransaction}   from "../entity/WalletTransaction"
import { Stream } from "stream";
import { Between, LessThan, MoreThan } from "typeorm";
import { BankAccount } from "../entity/BankAccount";
import { Delivery } from "../entity/Delivery";
import {formatGoldWeight} from "../utills/HelperFunctions"
import { start } from "repl";
import { stat } from "fs";
const token = process.env.TELEGRAM_BOT_TOKEN || "7622536105:AAFR0NDFR27rLDF270uuL5Ww_K0XZi61FCw";

export class AdminController{
    private adminRepository=AppDataSource.getRepository(Admin)
    private accessPointRepository=AppDataSource.getRepository(accessPoint)
    private deliveryRepository=AppDataSource.getRepository(Delivery)
    private userRepository=AppDataSource.getRepository(User)
    private jwtService=new JwtGenerator()
    private telegramUserRepository=AppDataSource.getRepository(TelegramUser)
    private invoiceRepository=AppDataSource.getRepository(Invoice)
    private appBankRepository=AppDataSource.getRepository(AppBankAccount)
    private bankRepository=AppDataSource.getRepository(BankAccount)
    private walletTransaction=AppDataSource.getRepository(WalletTransaction)
    private bot=new TelegramBot(token);

    /**
     * manage admin section
     * @param req 
     * @param res 
     * @param next 
     * @returns 
     */
    async registerAdmin(req: Request, res: Response, next: NextFunction){
        const bodyError = validationResult(req)
         if (!bodyError.isEmpty()) {
           return next(new responseModel(req, res,bodyError['errors'][0].msg,'admin',400,bodyError['errors'][0].msg ,null))
         }  
            const {
                firstName,
                lastName,
                phoneNumber,
                password,
            } =req.body
        console.log("req",req.body);
            
        const hashPass=await bcrypt.hash(password, 10)
        let newAdmin = this.adminRepository.create({
            firstName,
            lastName,
            phoneNumber,
            password:hashPass,
        })
        await this.adminRepository.save(newAdmin)
        return  next(new responseModel(req, res,"ادمین ایجاد شد",'admin', 200,"ادمین ایجاد شد",null))
    }
    async loginAdmin(req: Request, res: Response, next: NextFunction){
        const bodyError = validationResult(req)
        if (!bodyError.isEmpty()) {
          return next(new responseModel(req, res,bodyError['errors'][0].msg,'admin',400,bodyError['errors'][0].msg ,null))
        }  
        console.log('body' , req.body)
        let admin = await this.adminRepository.findOne({
            where: {
                phoneNumber: req.body.phone
            }
        })
        console.log("log",req.body);
        
        console.log("fffffffffff",admin);
        
        if (!admin) {
            console.log('its here')
            return next(new responseModel(req, res,'کاربر پیدا نشد','login admin', 403, 'کاربر پیدا نشد', null))
        }
        if (admin.isBlocked) {
            console.log('its here222')
            return next(new responseModel(req, res,'کاربر تعلیق شده است' ,'login admin', 403, 'کاربر تعلیق شده است', null))
        }
        const compare = await bcrypt.compare(req.body.password, admin.password)
        if (!compare) {
            return next(new responseModel(req, res,'اطلاعات کاربری اشتباه است','login', 403,'اطلاعات کاربری اشتباه است', null))
        }
        

        console.log("admin",admin);
        
        let tokenData: jwtGeneratorInterfaceAdmin = {
            id: admin.id,
            firstName: admin.firstName,
            lastName: admin.lastName,
            isBlocked: admin.isBlocked,
            phoneNumber : admin.phoneNumber,
            role : admin.role
        }
        
        let token = await this.jwtService.tokenizeAdminToken(tokenData)
        return next(new responseModel(req, res,null, 'login admin', 200, null, token))
    }
    async getAllAdmins(req: Request, res: Response, next: NextFunction){
        // await 
        const admins=await this.adminRepository.find()
        return next(new responseModel(req, res,null, 'admin', 200, null, admins))
    }


   /**
    * user section
    * @param req 
    * @param res 
    * @param next 
    * @returns 
    */


    async getApproveRequest(req: Request, res: Response, next: NextFunction){
        const users=await this.userRepository.find({where:{verificationStatus:1}})
        return next(new responseModel(req, res,null, 'admin', 200, null, users))

    }
    async approveUser(req: Request, res: Response, next: NextFunction){
        const userId=req.params.id
        const user=await this.userRepository.findOne({where:{id:+userId},relations:["telegram"]})
        if(!user){
            return  next(new responseModel(req, res,"کاربر وجود ندارد",'profile', 402,"کاربر وجود ندارد",null))
        }
        user.verificationStatus=2
        if(user.telegram){
            user.telegram.authState="awaiting_phone"
        await this.userRepository.save(user.telegram)
            
        }
        await this.userRepository.save(user)
        return next(new responseModel(req, res,null, 'admin', 200, null, user))

    }
    async rejectUser(req: Request, res: Response, next: NextFunction){
        const userId=req.params.id

        const user=await this.userRepository.findOneBy({id:+userId})

        if(!user){
            return  next(new responseModel(req, res,"کاربر وجود ندارد",'profile', 402,"کاربر وجود ندارد",null))
        }
        const telUser=await this.telegramUserRepository.findOne({where:{user:{id:+userId}}})

        if(telUser){
            telUser.authState="rejected"
        }

        user.verificationStatus=3

        await this.userRepository.save(user)
        return next(new responseModel(req, res,null, 'admin', 200, null, user))
    }
    async getAllUser(req: Request, res: Response, next: NextFunction){
        const users=await this.userRepository.find()
        return next(new responseModel(req, res,null, 'admin', 200, null, users))
    }

 

    /**
     * invoice section
     * @param req 
     * @param res 
     * @param next 
     * @returns 
     */

    async getSellInvoicesWithStatus(req: Request, res: Response, next: NextFunction){
        const type=0
        const status=+req.params.status
        const invoices=await this.invoiceRepository.find({where:{status,type},relations:["seller","bankAccount","appBankAccount","admin","accounter"]})
        return next(new responseModel(req, res,null, 'admin', 200, null, invoices))
    }
    async getBuyInvoicesWithStatus(req: Request, res: Response, next: NextFunction){
        const type=1
        const status=+req.params.status
        const invoices=await this.invoiceRepository.find({where:{status,type},relations:["buyer","bankAccount","appBankAccount","admins"]})
        return next(new responseModel(req, res,null, 'admin', 200, null, invoices))
    }

    async getAllInvoice(req: Request, res: Response, next: NextFunction){
        const invoices=await this.invoiceRepository.find({relations:["buyer","bankAccount","appBankAccount","admins","seller"]})
        return next(new responseModel(req, res,null, 'admin', 200, null, invoices))
    }
    async getAllSellInvoice(req: Request, res: Response, next: NextFunction){
        const type=0
        const invoices=await this.invoiceRepository.find({where:{type},relations:["seller","bankAccount","appBankAccount","admin","accounter"]})
        return next(new responseModel(req, res,null, 'admin', 200, null, invoices))
    }    
    async getAllBuyInvoice(req: Request, res: Response, next: NextFunction){
        const type=1
        const invoices=await this.invoiceRepository.find({where:{type},relations:["buyer","bankAccount","appBankAccount","admin","accounter"]})
        return next(new responseModel(req, res,null, 'admin', 200, null, invoices))
    }

    async getAllInvoiceForAdmin(req: Request, res: Response, next: NextFunction){
        const invoices=await this.invoiceRepository.find({where:{status:LessThan(2)}
        ,relations:["buyer","bankAccount","appBankAccount","seller"],order:{id:"DESC"}})
        return next(new responseModel(req, res,null, 'admin', 200, null, invoices))
    }

    async getAllInvoiceForAccounter(req: Request, res: Response, next: NextFunction){
        const invoices=await this.invoiceRepository.find({where:{status:Between(2,6),},
        relations:["buyer","bankAccount","appBankAccount","seller"],
        order:{id:"DESC"}
    })
        return next(new responseModel(req, res,null, 'admin', 200, null, invoices))
    }
    

   
    async approveSellInvoice(req: Request, res: Response, next: NextFunction){
         const invoiceId=+req.params.id
         const description=req.body.description
         const queryRunner = AppDataSource.createQueryRunner()
         await queryRunner.connect()
         await queryRunner.startTransaction()
         try{
            const admin=await this.adminRepository.findOne({where:{id:req.admin.id}})
            const invoice=await this.invoiceRepository.findOne({where:{id:invoiceId},relations:["seller","admins"]})
            const telegramUser=await this.telegramUserRepository.findOne({where:{user:{id:invoice.seller.id}}})
            invoice.status=3
            invoice.admins=[admin]
            invoice.adminDescription=description
            const time= new Date().toLocaleString('fa-IR').split(',')[1]
            const date= new Date().toLocaleString('fa-IR').split(',')[0]
            const message = `
<b>کاربر گرامی</b>

درخواست حواله فروش شما <b>تایید شد</b>:

<b>مشخصات حواله:</b>
* <b>مقدار:</b> ${invoice.goldWeight} گرم  
* <b>مبلغ:</b> ${invoice.totalPrice.toLocaleString()} تومان  
* <b>شماره پیگیری:</b> ${invoice.invoiceId}  
* <b>تاریخ و ساعت:</b> ${date} ${time}

<b>توضیحات:</b>
${description}
`;
            await queryRunner.manager.save(invoice)
            await queryRunner.commitTransaction()
            this.sendMessageWithInline(message,telegramUser.chatId,invoiceId)
            return next(new responseModel(req, res,null, 'admin', 200, null, invoice)) 
         }catch(err){
            await queryRunner.rollbackTransaction()
            console.log("error",err);
            return next(new responseModel(req, res,"خطای داخلی سیستم",'invoice', 500,"خطای داخلی سیستم",null))
         }finally{
            console.log('transaction released')
            await queryRunner.release()
         }
        
    }

    async rejectSellInvoice(req: Request, res: Response, next: NextFunction){
        const invoiceId=+req.params.id
         const description=req.body.description
         const queryRunner = AppDataSource.createQueryRunner()
         await queryRunner.connect()
         await queryRunner.startTransaction()
         try{
            const admin=await this.adminRepository.findOne({where:{id:req.admin.id}})
            const invoice=await this.invoiceRepository.findOne({where:{id:invoiceId},relations:["seller","admins"]})
            const telegramUser=await this.telegramUserRepository.findOne({where:{user:{id:invoice.seller.id}}})
            invoice.status=4
            invoice.admins=[admin]
            invoice.adminDescription=description
            const time= new Date().toLocaleString('fa-IR').split(',')[1]
            const date= new Date().toLocaleString('fa-IR').split(',')[0]

            await queryRunner.manager.save(invoice)
            await queryRunner.commitTransaction()
            const message = `
<b>کاربر گرامی</b>

درخواست حواله فروش شما <b>رد شد</b>:

<b>مشخصات حواله:</b>
* <b>مقدار:</b> ${invoice.goldWeight} گرم  
* <b>مبلغ:</b> ${invoice.totalPrice.toLocaleString()} تومان  
* <b>شماره پیگیری:</b> ${invoice.invoiceId}  
* <b>تاریخ و ساعت:</b> ${date} ${time}

<b>دلیل رد شدن:</b>
${description}
`;

            
            showMainMenu(this.bot,telegramUser.chatId,message)              
            return next(new responseModel(req, res,null, 'admin', 200, null, invoice)) 
         }catch(err){
            await queryRunner.rollbackTransaction()
            console.log("error",err);
            return next(new responseModel(req, res,"خطای داخلی سیستم",'invoice', 500,"خطای داخلی سیستم",null))
         }finally{
            console.log('transaction released')
            await queryRunner.release()
         }

    }




    async approveBuyInvoice(req: Request, res: Response, next: NextFunction){
        const invoiceId=+req.params.id
        const description=req.body.description
        const appBankAccountId=req.body.appBankAccountId

        console.log("invoceeId",invoiceId);
        console.log("description",description);
        console.log("appBanK",appBankAccountId);
        
        

        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()
        try{
           const admin=await this.adminRepository.findOne({where:{id:req.admin.id}})
           const invoice=await this.invoiceRepository.findOne({where:{id:invoiceId},relations:["buyer"]})
           console.log("invoice",invoice);
           
           const telegramUser=await this.telegramUserRepository.findOne({where:{user:{id:invoice.buyer.id}}})
           const appBank=await this.appBankRepository.findOne({where:{id:appBankAccountId}})
           console.log("apppppp",appBank);
           
           invoice.status=3

           
        //    const adddmin=[...invoice.admins,...[admin]]
        //    const seconndAdmin=[...invoice.admins,admin]

        //    console.log("adddAdmin",adddmin);
        //    console.log("secondAdmin",seconndAdmin);
           
           

           invoice.admins=[admin]
           invoice.adminDescription=description
           invoice.appBankAccount=appBank
           await queryRunner.manager.save(invoice)
           await queryRunner.commitTransaction()
           

            const time= new Date().toLocaleString('fa-IR').split(',')[1]
            const date= new Date().toLocaleString('fa-IR').split(',')[0]

            const message = `
            <b>کاربر گرامی</b>
            
            درخواست حواله خرید شما با مشخصات زیر تایید شد:
            
            <b>مقدار:</b> ${invoice.goldWeight} گرم
            <b>مبلغ:</b> ${invoice.totalPrice.toLocaleString()} تومان
            <b>شماره پیگیری:</b> ${invoice.invoiceId}
            <b>تاریخ و ساعت:</b> ${date} - ${time}
            
            لطفاً مبلغ را به حساب زیر واریز نمایید:
            
            <b>شبا:</b> ${appBank.shebaNumber}
            <b>بانک:</b> ${appBank.name}
            <b>به نام:</b> ${appBank.ownerName}
            `
           showMainMenu(this.bot,telegramUser.chatId,message)      

           return next(new responseModel(req, res,null, 'admin', 200, null, invoice)) 

        }catch(err){
           await queryRunner.rollbackTransaction()
           console.log("error",err);
           return next(new responseModel(req, res,"خطای داخلی سیستم",'invoice', 500,"خطای داخلی سیستم",null))
        }finally{
           console.log('transaction released')
           await queryRunner.release()
        }
    }

    async rejectBuyInvoice(req: Request, res: Response, next: NextFunction){    
        const invoiceId=+req.params.id
        const description=req.body.description
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()
        try{
           
           const admin=await this.adminRepository.findOne({where:{id:req.admin.id}})
           const invoice=await this.invoiceRepository.findOne({where:{id:invoiceId},relations:['buyer']})
           const telegramUser=await this.telegramUserRepository.findOne({where:{user:{id:invoice.buyer.id}}})
           invoice.status=4
           invoice.admins.push(admin)
           invoice.adminDescription=description

           const time= new Date().toLocaleString('fa-IR').split(',')[1]
           const date= new Date().toLocaleString('fa-IR').split(',')[0]
           await queryRunner.manager.save(invoice)
           await queryRunner.commitTransaction()
           const message = `
           <b>کاربر گرامی</b>
           
           درخواست حواله خرید شما <b>رد شد</b>:
           
           <b>مشخصات حواله:</b>
           * <b>مقدار:</b> ${invoice.goldWeight} گرم  
           * <b>مبلغ:</b> ${invoice.totalPrice.toLocaleString()} تومان  
           * <b>شماره پیگیری:</b> ${invoice.invoiceId}  
           * <b>تاریخ و ساعت:</b> ${date} ${time}
           
           <b>دلیل رد شدن:</b>
           ${description}
           `;
           
           
           showMainMenu(this.bot,telegramUser.chatId,message)  
           return next(new responseModel(req, res,null, 'admin', 200, null, invoice)) 
        }catch(err){
           await queryRunner.rollbackTransaction()
           console.log("error",err);
           return next(new responseModel(req, res,"خطای داخلی سیستم",'invoice', 500,"خطای داخلی سیستم",null))
        }finally{
           console.log('transaction released')
           await queryRunner.release()
        }
    }




   /**
    * Accounter section
    * @param req 
    * @param res 
    * @param next 
    * @returns 
    */

    async approvePaymentBuy(req: Request, res: Response, next: NextFunction){
        const id=+req.params.id
        const {description}  =req.body
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()
        
         try{
            const admin=await this.adminRepository.findOne({where:{id:req.admin.id}})
            const invoice=await this.invoiceRepository.findOne({where:{id},relations:{buyer:{telegram:true,wallet:true},admins:true}})
            const systemUser=await this.userRepository.findOne({where:{isSystemUser:true},relations:["wallet"]})
            const walletTransaction=await this.walletTransaction.findOne({where:{authority:invoice.authority}})
            // if(!invoice){
            //     return  next(new responseModel(req, res," وجود ندارد",'reject', 402," وجود ندارد",null))
            // }
    
            invoice.status=6
            invoice.accounterDescription=description
             

            console.log("addddf",invoice.admins);
            console.log("aaaaa",admin);
            
            const array=invoice.admins

            array.push(admin)


            console.log(array);
            


            // const a=invoice,admins
            // invoice.admins.push(admin)
            // invoice.admins=[...invoice.admins,admin]
    
            walletTransaction.status="1"
            invoice.admins=array
    
    
            const buyerGoldWeight = parseFloat(invoice.buyer.wallet.goldWeight.toString());
            // const buyerBalance = parseFloat(invoice.buyer.wallet.balance.toString());
            const systemUserGoldWeight = parseFloat(systemUser.wallet.goldWeight.toString());
            // const systemUserBalance = parseFloat(systemUser.wallet.balance.toString());
            const invoiceGoldWeight = parseFloat(invoice.goldWeight.toString());
            // const invoiceTotalPrice = parseFloat(invoice.totalPrice.toString());
    
            
            
            invoice.buyer.wallet.goldWeight = parseFloat((buyerGoldWeight + invoiceGoldWeight).toFixed(3));
            // invoice.buyer.wallet.balance = Math.round(buyerBalance - invoiceTotalPrice);
    
            systemUser.wallet.goldWeight = parseFloat((systemUserGoldWeight - invoiceGoldWeight).toFixed(3));
            // systemUser.wallet.balance = Math.round(systemUserBalance + invoiceTotalPrice);

           await queryRunner.manager.save(invoice)
           await queryRunner.manager.save(invoice.buyer.wallet)
           await queryRunner.manager.save(systemUser)
           await queryRunner.manager.save(walletTransaction)


            
           

            const time= new Date().toLocaleString('fa-IR').split(',')[1]
            const date= new Date().toLocaleString('fa-IR').split(',')[0]

            const message = `
          <b>کاربر گرامی</b>
        
        پرداخت حواله خرید شما <b>قبول شد</b>:
        
        <b>مشخصات حواله:</b>
        * <b>مقدار:</b> ${invoice.goldWeight} گرم  
        * <b>مبلغ:</b> ${invoice.totalPrice.toLocaleString()} تومان  
        * <b>شماره پیگیری:</b> ${invoice.invoiceId}  
        * <b>تاریخ و ساعت:</b> ${date} ${time}
        
        <b>توضیحات:</b>
        ${description}
        `;

         this.bot.sendMessage(invoice.buyer.telegram.chatId,message,{parse_mode:"HTML"})
         await queryRunner.commitTransaction()
         return next(new responseModel(req, res,null, 'admin', 200, null, invoice)) 
            
         }catch(err){
            console.log("fffffffffffffffffffffffffff");
            await queryRunner.rollbackTransaction()
            return next(new responseModel(req, res,"خطای داخلی سیستم",'invoice', 500,"خطای داخلی سیستم",null))}
    }



    async rejectPaymentBuy(req: Request, res: Response, next: NextFunction){
        const id=+req.params.id
        const {description}  =req.body
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()
        try{
            const admin=await this.adminRepository.findOne({where:{id:req.admin.id}})
            const invoice=await this.invoiceRepository.findOne({where:{id},relations:{buyer:{telegram:true,wallet:true},admins:true}})
            const walletTransaction=await this.walletTransaction.findOne({where:{authority:invoice.authority}})
            if(!invoice){
                return  next(new responseModel(req, res," وجود ندارد",'reject', 402," وجود ندارد",null))
            }
    
            
    
            invoice.status=7
            invoice.accounterDescription=description
            invoice.admins=[...invoice.admins,admin]

            walletTransaction.status="2"
    
            await queryRunner.manager.save(walletTransaction)
            await queryRunner.manager.save(invoice)
            const time= new Date().toLocaleString('fa-IR').split(',')[1]
            const date= new Date().toLocaleString('fa-IR').split(',')[0]
    
            const message = `
            <b>کاربر گرامی</b>
            
            پرداخت حواله خرید شما <b>رد شد</b>:
            
            <b>مشخصات حواله:</b>
            * <b>مقدار:</b> ${invoice.goldWeight} گرم  
            * <b>مبلغ:</b> ${invoice.totalPrice.toLocaleString()} تومان  
            * <b>شماره پیگیری:</b> ${invoice.invoiceId}  
            * <b>تاریخ و ساعت:</b> ${date} ${time}
            
            <b>دلیل رد شدن:</b>
            ${description}
            `;
          
            await queryRunner.commitTransaction()
            this.bot.sendMessage(invoice.buyer.telegram.chatId,message,{parse_mode:"HTML"})
            return next(new responseModel(req, res,null, 'admin', 200, null, invoice)) 
        }catch(err){
            console.log(err);
            
            await queryRunner.rollbackTransaction()
            return next(new responseModel(req, res,"خطای داخلی سیستم",'invoice', 500,"خطای داخلی سیستم",null))
        }finally{
            console.log('transaction released')
            await queryRunner.release()
        }
       
    }


    async getPaymentInfoForSell(req: Request, res: Response, next: NextFunction){
        const {shebaNumber,bankName,ownerName} =req.body
        const invoiceId=+req.params.id

        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()

        const time= new Date().toLocaleString('fa-IR').split(',')[1]
        const date= new Date().toLocaleString('fa-IR').split(',')[0]




        try{
            const admin=await this.adminRepository.findOne({where:{id:req.admin.id}})
            const invoice=await this.invoiceRepository.findOne({where:{id:invoiceId},relations:{seller:{telegram:true,wallet:true},admins:true}})


            if(!invoice || invoice.status!==3){
                return next(new responseModel(req, res,"درخواست نامعتبر",'invoice', 400,"درخواست نامعتبر",null))
            }

            const bankAccount=this.bankRepository.create({owner:invoice.seller,shebaNumber,name:bankName,ownerName})
            invoice.bankAccount=bankAccount
            invoice.admins=[...invoice.admins,admin]
            
            // const walletTransaction=this.walletTransaction.create({
            //     type:"0",
            //     status:"0",
            //     invoiceId:invoice.invoiceId,
            //     amount:invoice.totalPrice,
            //     wallet:invoice.seller.wallet,
            //     date,
            //     time
            // })

            await queryRunner.manager.save(bankAccount)
            await queryRunner.manager.save(invoice)
            // await queryRunner.manager.save(walletTransaction)

            const message = `
            <b>کاربر گرامی</b>
            
              دریافت اطلاعات بانکی شما <b>انجام شد</b>:
            
            <b>مشخصات حواله:</b>
            * <b>مقدار:</b> ${invoice.goldWeight} گرم  
            * <b>مبلغ:</b> ${invoice.totalPrice.toLocaleString()} تومان  
            * <b>شماره پیگیری:</b> ${invoice.invoiceId}  
            * <b>تاریخ و ساعت:</b> ${date} ${time}
             <b>مشخضات حساب دریافتی:</b>
            * <b> شماره شبا:</b> ${shebaNumber} 
            * <b>نام بانک:</b> ${bankName} 
            * <b>صاحب حساب:</b> ${ownerName} 
             
           
             در صورت اشتباه بودن اطلاعات دکمه <b>عدم تایید</b> را بزنید
             در صورت درست بودن اطلاعات دکمه <b>تایید</b> را بزنید
            
            `;
          
            await queryRunner.commitTransaction()
          
           
            this.bot.sendMessage(invoice.seller.telegram.chatId, message, {
                reply_markup: {
                  inline_keyboard: [
                    [
                        { text: 'عدم تایید', callback_data: `bank-nok:${invoiceId}` },
                        { text: 'تایید', callback_data: `bank-ok:${invoiceId}`},
                    ]
                  ]
                },
                parse_mode: "HTML"
             });

             
            
            return next(new responseModel(req, res,null, 'admin', 200, null, invoice)) 
 


        }catch(err){
            console.log(err);
            
            await queryRunner.rollbackTransaction()
            return next(new responseModel(req, res,"خطای داخلی سیستم",'invoice', 500,"خطای داخلی سیستم",null))
        }finally{
            console.log('transaction released')
            await queryRunner.release()
        }


    }

    async sellPaymentDone(req: Request, res: Response, next: NextFunction){
        const id=+req.params.id
        const {authority,description}=req.body
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()

        const time= new Date().toLocaleString('fa-IR').split(',')[1]
        const date= new Date().toLocaleString('fa-IR').split(',')[0]

        try{
            const admin=await this.adminRepository.findOne({where:{id:req.admin.id}})
            const invoice=await this.invoiceRepository.findOne({where:{id:id},relations:{seller:{telegram:true,wallet:true},admins:true}})
            const invoiceTotalPrice = parseFloat(invoice.totalPrice.toString());
            const sellerBalance = parseFloat(invoice.seller.wallet.balance.toString());
            
            invoice.seller.wallet.balance = Math.round(sellerBalance - invoiceTotalPrice);
            invoice.admins=[...invoice.admins,admin]
            invoice.authority=authority
            invoice.status=6
            invoice.accounterDescription=description
            
            const walletTransaction=this.walletTransaction.create({
                type:"0",
                status:"1",
                authority,
                invoiceId:invoice.invoiceId,
                amount:invoice.totalPrice,
                wallet:invoice.seller.wallet,
                date,
                time
            })

            // await queryRunner.manager.save(bankAccount)
            await queryRunner.manager.save(invoice)
            await queryRunner.manager.save(invoice.seller.wallet)
            await queryRunner.manager.save(walletTransaction)

            const message = `
            <b>کاربر گرامی</b>
          
          پرداخت حواله فروش شما <b>انجام شد</b>:
          
          <b>مشخصات حواله:</b>
          * <b>مقدار:</b> ${invoice.goldWeight} گرم  
          * <b>مبلغ:</b> ${invoice.totalPrice.toLocaleString()} تومان  
          * <b>شماره پیگیری:</b> ${invoice.invoiceId}  
          * <b>تاریخ و ساعت:</b> ${date} ${time}
          * <b>شناسه پرداخات:</b> ${authority} 
          
          <b>توضیحات</b>
           ${description}
          
          
          `;
  
           this.bot.sendMessage(invoice.seller.telegram.chatId,message,{parse_mode:"HTML"})
          
            await queryRunner.commitTransaction()
            return next(new responseModel(req, res,null, 'admin', 200, null, invoice)) 
 


        }catch(err){
            console.log(err);
            
            await queryRunner.rollbackTransaction()
            return next(new responseModel(req, res,"خطای داخلی سیستم",'invoice', 500,"خطای داخلی سیستم",null))
        }finally{
            console.log('transaction released')
            await queryRunner.release()
        }
    }
    async sellPaymentCancel(req: Request, res: Response, next: NextFunction){
        const id=+req.params.id
        const {description}=req.body
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()

        const time= new Date().toLocaleString('fa-IR').split(',')[1]
        const date= new Date().toLocaleString('fa-IR').split(',')[0]

        try{
            const admin=await this.adminRepository.findOne({where:{id:req.admin.id}})
            const invoice=await this.invoiceRepository.findOne({where:{id:id},relations:{seller:{telegram:true,wallet:true},admins:true}})
            const invoiceTotalPrice = parseFloat(invoice.totalPrice.toString());
            const sellerBalance = parseFloat(invoice.seller.wallet.balance.toString());
            
            invoice.seller.wallet.balance = Math.round(sellerBalance - invoiceTotalPrice);
            invoice.admins=[...invoice.admins,admin]
            invoice.accounterDescription=description
            invoice.status=7
            
            // await queryRunner.manager.save(bankAccount)
            await queryRunner.manager.save(invoice)
            await queryRunner.manager.save(invoice.seller.wallet)
            const message = `
            <b>کاربر گرامی</b>
          
          پرداخت حواله فروش شما <b>لغو شد</b>:
          
          <b>مشخصات حواله:</b>
          * <b>مقدار:</b> ${invoice.goldWeight} گرم  
          * <b>مبلغ:</b> ${invoice.totalPrice.toLocaleString()} تومان  
          * <b>شماره پیگیری:</b> ${invoice.invoiceId}  
          * <b>تاریخ و ساعت:</b> ${date} ${time}
          
          
           <b>توضیحات</b>
           ${description}
          
          `;
  
           this.bot.sendMessage(invoice.seller.telegram.chatId,message,{parse_mode:"HTML"})
          
            await queryRunner.commitTransaction()
            return next(new responseModel(req, res,null, 'admin', 200, null, invoice)) 
 


        }catch(err){
            console.log(err);
            
            await queryRunner.rollbackTransaction()
            return next(new responseModel(req, res,"خطای داخلی سیستم",'invoice', 500,"خطای داخلی سیستم",null))
        }finally{
            console.log('transaction released')
            await queryRunner.release()
        }

    }


    async getDeliverOrder(req: Request, res: Response, next: NextFunction){
        const type=1
        const invoices=await this.invoiceRepository.find({where:{type,status:6},relations:["buyer","bankAccount","appBankAccount","admins","deliveries"]})
        return next(new responseModel(req, res,null, 'admin', 200, null, invoices))
    }


  
    async  delivery(req: Request, res: Response, next: NextFunction){
         const id=+req.params.id
         const {type,amount,destUserId,description}=req.body

         console.log(req.body);
         
         const queryRunner = AppDataSource.createQueryRunner()
         await queryRunner.connect()
         await queryRunner.startTransaction()
         const time= new Date().toLocaleString('fa-IR').split(',')[1]
         const date= new Date().toLocaleString('fa-IR').split(',')[0]
         
         try{
            const admin=await this.adminRepository.findOne({where:{id:req.admin.id}})
            const invoice=await this.invoiceRepository.findOne({where:{id:id},relations:{buyer:{telegram:true,wallet:true},admins:true}})
            

            if(invoice.status!==6){
                return next(new responseModel(req, res,"تراکتش نامعتبر",'invoice', 400,"تراکتش نامعتبر",null))
            }

        let newDelivery
        let destUser
        if(type==1){
            newDelivery=this.deliveryRepository.create({
                type,
                date,
                time,
                mainUser:invoice.buyer,
                description,
                invoice,
              })
            
        }else{
            destUser=await  this.userRepository.findOne({where:{id:destUserId},relations:{wallet:true,telegram:true}})
            const destUserGoldWeight = parseFloat(destUser.wallet.goldWeight.toString());
            newDelivery=this.deliveryRepository.create({
                type,
                date,
                time,
                mainUser:invoice.buyer,
                description,
                invoice,
                destUser,
              })

              destUser.wallet.goldWeight=destUserGoldWeight+formatGoldWeight(amount)

        }
         
        const remain= invoice.goldPrice - formatGoldWeight(amount)
        invoice.buyer.wallet.goldWeight=invoice.buyer.wallet.goldWeight-formatGoldWeight(amount)
        invoice.remainGoldWeight=remain
        if(remain>0){
            invoice.status=8
        }else{
            invoice.status=9
        }

        invoice.admins=[...invoice.admins,admin]



        await queryRunner.manager.save(invoice)
        await queryRunner.manager.save(invoice.buyer.wallet)
        await queryRunner.manager.save(destUser.wallet)
        await queryRunner.manager.save(newDelivery)

        await queryRunner.commitTransaction()
        return next(new responseModel(req, res,null, 'admin', 200, null, invoice)) 

         }catch(err){
            console.log(err);
            
            await queryRunner.rollbackTransaction()
            return next(new responseModel(req, res,"خطای داخلی سیستم",'invoice', 500,"خطای داخلی سیستم",null))
         }finally{
            console.log('transaction released')
            await queryRunner.release()
         }


    }

    


    private  generateOTP(limit) {          
        var digits = '0123456789';
        let OTP = '';
        for (let i = 0; i < limit; i++ ) {
            OTP += digits[Math.floor(Math.random() * 10)];
        }
        return OTP;
    }

    


    sendMessageWithInline(message : string ,chatId : any ,invoiceId:any){
       this.bot.sendMessage(chatId,message, {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: 'ارسال اطلاعات بانکی', callback_data: `pay-bank:${invoiceId}` },
                  { text: 'هماهنگی تلفنی', callback_data: `pay-phone:${invoiceId}`},

                ]
              ]
            },
            parse_mode:"HTML"
         });
    }

    

    
  

}