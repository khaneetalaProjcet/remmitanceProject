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
import { Actions } from "../entity/Actions";
import { CoinWallet } from "../entity/CoinWallet";
import { start } from "repl";
import { stat } from "fs";
import { log } from "console";
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
    private actionRepository=AppDataSource.getRepository(Actions)
    private coinWalletRepository=AppDataSource.getRepository(CoinWallet)
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
        let admin = await this.adminRepository.findOneOrFail({
            where: {
                phoneNumber: req.body.phone,
                isDelete:false
            },
            relations:{actions:true,accessPoints:true,invoices:true}
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
        return next(new responseModel(req, res,null, 'login admin', 200, null, {token,admin}))
    }
    async getAllAdmins(req: Request, res: Response, next: NextFunction){
        // await 
        const admins=await this.adminRepository.find({where:{isDelete:false}})
        return next(new responseModel(req, res,null, 'admin', 200, null, admins))
    }

    async checkToken(req: Request, res: Response, next: NextFunction){
        const admimId=req.admin.id
        const admin=await this.adminRepository.findOneOrFail({where:{id:admimId}})
        return next(new responseModel(req, res,null, 'login admin', 200, null, admin))
    }


    async removeAdmin(req: Request, res: Response, next: NextFunction){
        const id=+req.params.id

        try{
         const admin= await this.adminRepository.findOneOrFail({where:{id:id}})
         if(!admin){
            return next(new responseModel(req, res,null,"درخواست نا معتبر", 400, "درخواست نا معتبر", null))

         }
         admin.isDelete=true
         await this.adminRepository.save(admin)
         return next(new responseModel(req, res,null,null, 200,null, admin))
        }catch(err){
            return next(new responseModel(req, res,"خطای داخلی سیستم",'invoice', 500,"خطای داخلی سیستم",null))
        }

    }

    async inActiveAdmin(req: Request, res: Response, next: NextFunction){
        const id=+req.params.id
        try{
         const admin= await this.adminRepository.findOneOrFail({where:{id:id}})
         if(!admin){
            return next(new responseModel(req, res,null,"درخواست نا معتبر", 400, "درخواست نا معتبر", null))
         }
         admin.isBlocked=!admin.isBlocked
         await this.adminRepository.save(admin)
         return next(new responseModel(req, res,null,null, 200,null, admin))
        }catch(err){
            return next(new responseModel(req, res,"خطای داخلی سیستم",'invoice', 500,"خطای داخلی سیستم",null))
        }
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
        const users=await this.userRepository.find({where:{isSystemUser:false},relations:{wallet:{transactions:true}}})
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
        const invoices=await this.invoiceRepository.find({where:{panelTabel:1}
        ,relations:["buyer","bankAccount","appBankAccount","seller","product"],order:{id:"DESC"}})
        return next(new responseModel(req, res,null, 'admin', 200, null, invoices))
    }

    async getAllInvoiceForAccounter(req: Request, res: Response, next: NextFunction){
        const invoices=await this.invoiceRepository.find({where:{panelTabel:2},
        relations:["buyer","bankAccount","appBankAccount","seller","product"],
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
         const time= new Date().toLocaleString('fa-IR').split(',')[1]
        const date= new Date().toLocaleString('fa-IR').split(',')[0]
         try{
            const admin=await this.adminRepository.findOne({where:{id:req.admin.id}})
            const invoice=await this.invoiceRepository.findOne({where:{id:invoiceId},relations:["seller","admins","product"]})
            const telegramUser=await this.telegramUserRepository.findOne({where:{user:{id:invoice.seller.id}}})
            if(!invoice || invoice.status!==2){
                return next(new responseModel(req, res,"تراکتش نامعتبر",'invoice', 400,"تراکتش نامعتبر",null))
            }
            const newAction=this.actionRepository.create({admin,type:2,fromStatus:2,toStatus:4,date,time,invoice})
            invoice.status=4
            invoice.panelTabel=2
            invoice.admins=[admin]
            invoice.adminDescription=description

            let message

            if(invoice.product.type=="1"){
                message = `
                <b>کاربر گرامی</b>
                
                درخواست حواله فروش شما <b>تایید شد</b>:
                
                <b>مشخصات حواله:</b>
                * <b>نام:</b> ${invoice.product.persianName} 
                * <b>تعداد:</b> ${invoice.coinCount} عدد  
                * <b>مبلغ:</b> ${invoice.totalPrice.toLocaleString()} تومان  
                * <b>شماره پیگیری:</b> ${invoice.invoiceId}  
                * <b>تاریخ و ساعت:</b> ${date} ${time}
                
                <b>توضیحات:</b>
                ${description}
                `;

            }else{
                message = `
                <b>کاربر گرامی</b>
                
                درخواست حواله فروش شما <b>تایید شد</b>:
                
                <b>مشخصات حواله:</b>
                * <b>مقدار:</b> ${invoice.goldWeight} مثقال  
                * <b>مبلغ:</b> ${invoice.totalPrice.toLocaleString()} تومان  
                * <b>شماره پیگیری:</b> ${invoice.invoiceId}  
                * <b>تاریخ و ساعت:</b> ${date} ${time}
                
                <b>توضیحات:</b>
                ${description}
                `;
            }
            
     
            await queryRunner.manager.save(invoice)
            await queryRunner.manager.save(newAction)
            
            this.bot.sendMessage(telegramUser.chatId,message,{parse_mode:"HTML"})    
            await queryRunner.commitTransaction()
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
         const time= new Date().toLocaleString('fa-IR').split(',')[1]
         const date= new Date().toLocaleString('fa-IR').split(',')[0]
         try{
            const admin=await this.adminRepository.findOne({where:{id:req.admin.id}})
            const invoice=await this.invoiceRepository.findOne({where:{id:invoiceId},relations:["seller","admins","product"]})
            const telegramUser=await this.telegramUserRepository.findOne({where:{user:{id:invoice.seller.id}}})
            if(!invoice || invoice.status!==2){
                return next(new responseModel(req, res,"تراکتش نامعتبر",'invoice', 400,"تراکتش نامعتبر",null))
               }
    
            const newAction=this.actionRepository.create({admin,type:2,fromStatus:2,toStatus:5,date,time,invoice})
    
            invoice.status=5
            invoice.panelTabel=1
          
            invoice.admins=[admin]
            invoice.adminDescription=description
          

            await queryRunner.manager.save(invoice)
            await queryRunner.manager.save(newAction)

            let message

            if(invoice.product.type=="1"){
                message = `
                <b>کاربر گرامی</b>
                
                درخواست حواله فروش شما <b>رد شد</b>:
                
                <b>مشخصات حواله:</b>
                * <b>نام:</b> ${invoice.product.persianName} 
                * <b>تعداد:</b> ${invoice.coinCount} عدد  
                * <b>مبلغ:</b> ${invoice.totalPrice.toLocaleString()} تومان  
                * <b>شماره پیگیری:</b> ${invoice.invoiceId}  
                * <b>تاریخ و ساعت:</b> ${date} ${time}
                
                <b>توضیحات:</b>
                ${description}
                `;

            }else{
                message = `
                <b>کاربر گرامی</b>
                
                درخواست حواله فروش شما <b>رد شد</b>:
                
                <b>مشخصات حواله:</b>
                * <b>مقدار:</b> ${invoice.goldWeight} مثقال  
                * <b>مبلغ:</b> ${invoice.totalPrice.toLocaleString()} تومان  
                * <b>شماره پیگیری:</b> ${invoice.invoiceId}  
                * <b>تاریخ و ساعت:</b> ${date} ${time}
                
                <b>دلیل رد شدن:</b>
                ${description}
                `;
                
            }
           
          
            
            this.bot.sendMessage(telegramUser.chatId,message,{parse_mode:"HTML"})     
            await queryRunner.commitTransaction()            
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
        const time= new Date().toLocaleString('fa-IR').split(',')[1]
        const date= new Date().toLocaleString('fa-IR').split(',')[0]
        

        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()
        try{
           const admin=await this.adminRepository.findOne({where:{id:req.admin.id}})
           const invoice=await this.invoiceRepository.findOne({where:{id:invoiceId},relations:["buyer","product"]})



           if(!invoice || invoice.status!==2){
            return next(new responseModel(req, res,"تراکتش نامعتبر",'invoice', 400,"تراکتش نامعتبر",null))
           }

           
          
           const telegramUser=await this.telegramUserRepository.findOne({where:{user:{id:invoice.buyer.id}}})
           const appBank=await this.appBankRepository.findOne({where:{id:appBankAccountId}})
           console.log("apppppp",appBank);

           const newAction=this.actionRepository.create({admin,type:2,fromStatus:2,toStatus:4,date,time,invoice})
           
           

           
        //    const adddmin=[...invoice.admins,...[admin]]
        //    const seconndAdmin=[...invoice.admins,admin]

        //    console.log("adddAdmin",adddmin);
        //    console.log("secondAdmin",seconndAdmin);
           
           
           invoice.status=4
           invoice.admins=[admin]
           invoice.panelTabel=2
           invoice.adminDescription=description
           invoice.appBankAccount=appBank
           await queryRunner.manager.save(invoice)
           await queryRunner.manager.save(newAction)

           let message

           if(invoice.product.type=="1"){
               message = `
                 <b>کاربر گرامی</b>
            
               درخواست حواله خرید شما با مشخصات زیر تایید شد:
               * <b>نام:</b> ${invoice.product.persianName} 
               * <b>تعداد:</b> ${invoice.coinCount} عدد  
               * <b>مبلغ:</b> ${invoice.totalPrice.toLocaleString()} تومان  
               * <b>شماره پیگیری:</b> ${invoice.invoiceId}  
               * <b>تاریخ و ساعت:</b> ${date} ${time}
                <b>شبا:</b> ${appBank.shebaNumber}
               <b>بانک:</b> ${appBank.name}
              <b>به نام:</b> ${appBank.ownerName}
               
               `;

           }else{
            message = `
            <b>کاربر گرامی</b>
            
            درخواست حواله خرید شما با مشخصات زیر تایید شد:
            
            <b>مقدار:</b> ${invoice.goldWeight} مثقال
            <b>مبلغ:</b> ${invoice.totalPrice.toLocaleString()} تومان
            <b>شماره پیگیری:</b> ${invoice.invoiceId}
            <b>تاریخ و ساعت:</b> ${date} - ${time}
            
            لطفاً مبلغ را به حساب زیر واریز نمایید:
            
            <b>شبا:</b> ${appBank.shebaNumber}
            <b>بانک:</b> ${appBank.name}
            <b>به نام:</b> ${appBank.ownerName}
            `
           }
        
            
           this.bot.sendMessage(telegramUser.chatId,message,{parse_mode:"HTML"})     
           await queryRunner.commitTransaction()
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
        const time= new Date().toLocaleString('fa-IR').split(',')[1]
        const date= new Date().toLocaleString('fa-IR').split(',')[0]
        try{
           

         

           const admin=await this.adminRepository.findOne({where:{id:req.admin.id}})
           const invoice=await this.invoiceRepository.findOne({where:{id:invoiceId},relations:['buyer','product']})
           const telegramUser=await this.telegramUserRepository.findOne({where:{user:{id:invoice.buyer.id}}})


           if(!invoice || invoice.status!==2){
            return next(new responseModel(req, res,"تراکتش نامعتبر",'invoice', 400,"تراکتش نامعتبر",null))
           }

           const newAction=this.actionRepository.create({admin,type:2,fromStatus:2,toStatus:5,date,time,invoice})

           invoice.status=5
           invoice.panelTabel=1
           invoice.admins=[admin]
           invoice.adminDescription=description

         
           await queryRunner.manager.save(invoice)
           await queryRunner.manager.save(newAction)

           let message

           if(invoice.product.type=="1"){
            message = `
             <b>کاربر گرامی</b>
           
           درخواست حواله خرید شما <b>رد شد</b>:
            
            <b>مشخصات حواله:</b>
            * <b>نام:</b> ${invoice.product.persianName} 
            * <b>تعداد:</b> ${invoice.coinCount} عدد  
            * <b>مبلغ:</b> ${invoice.totalPrice.toLocaleString()} تومان  
            * <b>شماره پیگیری:</b> ${invoice.invoiceId}  
            * <b>تاریخ و ساعت:</b> ${date} ${time}
            
            <b>توضیحات:</b>
            ${description}
            `;

        }else{
           
            message = `
           <b>کاربر گرامی</b>
           
           درخواست حواله خرید شما <b>رد شد</b>:
           
           <b>مشخصات حواله:</b>
           * <b>مقدار:</b> ${invoice.goldWeight} مثقال  
           * <b>مبلغ:</b> ${invoice.totalPrice.toLocaleString()} تومان  
           * <b>شماره پیگیری:</b> ${invoice.invoiceId}  
           * <b>تاریخ و ساعت:</b> ${date} ${time}
           
           <b>دلیل رد شدن:</b>
           ${description}
           `;
        }
           
         
           
           this.bot.sendMessage(telegramUser.chatId,message,{parse_mode:"HTML"})  
           await queryRunner.commitTransaction()  
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
        const time= new Date().toLocaleString('fa-IR').split(',')[1]
        const date= new Date().toLocaleString('fa-IR').split(',')[0]
        
         try{
            const admin=await this.adminRepository.findOne({where:{id:req.admin.id}})
            const invoice=await this.invoiceRepository.findOne({where:{id},relations:{buyer:{telegram:true,wallet:true},admins:true}})
            const systemUser=await this.userRepository.findOne({where:{isSystemUser:true},relations:["wallet"]})
            const walletTransaction=await this.walletTransaction.findOne({where:{authority:invoice.authority}})
            if(!invoice || invoice.status!==6){
                return next(new responseModel(req, res,"تراکتش نامعتبر",'invoice', 400,"تراکتش نامعتبر",null))
            }
            const newAction=this.actionRepository.create({admin,type:2,fromStatus:6,toStatus:7,date,time,invoice})
            invoice.status=7
            invoice.accounterDescription=description
             

            console.log("addddf",invoice.admins);
            console.log("aaaaa",admin);
            

            

            walletTransaction.status="1"
            invoice.admins=[...invoice.admins,admin]
            invoice.panelTabel=3
    
    
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
           await queryRunner.manager.save(newAction)


            
           

         

        const message = `
          <b>کاربر گرامی</b>
        
        پرداخت حواله خرید شما <b>قبول شد</b>:
        
        <b>مشخصات حواله:</b>
        * <b>مقدار:</b> ${invoice.goldWeight} مثقال  
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
            console.log("fffffffffffffffffffffffffff",err);
            await queryRunner.rollbackTransaction()
            return next(new responseModel(req, res,"خطای داخلی سیستم",'invoice', 500,"خطای داخلی سیستم",null))
        }finally{
            console.log('transaction released')
            await queryRunner.release()
        }
    }



   async coninApprovePaymentBuy(req: Request, res: Response, next: NextFunction){
    const id=+req.params.id
    const {description}  =req.body
    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    const time= new Date().toLocaleString('fa-IR').split(',')[1]
    const date= new Date().toLocaleString('fa-IR').split(',')[0]
    
     try{
        const admin=await this.adminRepository.findOne({where:{id:req.admin.id}})
        const invoice=await this.invoiceRepository.findOne({where:{id},relations:{product:true,buyer:{telegram:true,wallet:{coins:{product:true}}},admins:true}})
       
        const walletTransaction=await this.walletTransaction.findOne({where:{authority:invoice.authority}})
        if(!invoice || invoice.status!==6){
            return next(new responseModel(req, res,"تراکتش نامعتبر",'invoice', 400,"تراکتش نامعتبر",null))
        }
        const newAction=this.actionRepository.create({admin,type:2,fromStatus:6,toStatus:7,date,time,invoice})
        invoice.status=7
        invoice.accounterDescription=description
         

        console.log("addddf",invoice.admins);
        console.log("aaaaa",admin);
        

        

        walletTransaction.status="1"
        invoice.admins=[...invoice.admins,admin]
        invoice.panelTabel=3

        


        const buyerCoins = invoice.buyer.wallet.coins
        const invoiceProduct=invoice.product
        const coinCount=invoice.coinCount

        const index=buyerCoins.findIndex(item=>item.product.id==invoiceProduct.id)

        if(index==-1){
            const newItem=this.coinWalletRepository.create({count:coinCount,wallet:invoice.buyer.wallet,product:invoiceProduct})
            await queryRunner.manager.save(newItem)
        }else{
            const item=buyerCoins[index]
            const newCount=item.count+coinCount
            invoice.buyer.wallet.coins[index].count=newCount
            await queryRunner.manager.save(invoice.buyer.wallet.coins)
        }

        
      

       await queryRunner.manager.save(invoice)
       await queryRunner.manager.save(walletTransaction)
       await queryRunner.manager.save(newAction)

     const message = `
      <b>کاربر گرامی</b>
    
    پرداخت حواله خرید شما <b>قبول شد</b>:
    
    <b>مشخصات حواله:</b>
    * <b>تعداد:</b> ${invoice.coinCount} عدد  
    * <b>نام محصول::</b> ${invoice.product.persianName} 
    * <b> مبلغ:</b> ${invoice.totalPrice.toLocaleString()} تومان  
    * <b>شماره پیگیری:</b> ${invoice.invoiceId}  
    * <b>تاریخ و ساعت:</b> ${date} ${time}
    
    <b>توضیحات:</b>
    ${description}
    `;

     this.bot.sendMessage(invoice.buyer.telegram.chatId,message,{parse_mode:"HTML"})
     await queryRunner.commitTransaction()
     return next(new responseModel(req, res,null, 'admin', 200, null, invoice)) 
        
     }catch(err){
        console.log("fffffffffffffffffffffffffff",err);
        await queryRunner.rollbackTransaction()
        return next(new responseModel(req, res,"خطای داخلی سیستم",'invoice', 500,"خطای داخلی سیستم",null))
    }finally{
        console.log('transaction released')
        await queryRunner.release()
    }
   }
 

   
    async paymnetBuyInfoByAccounter(req: Request, res: Response, next: NextFunction){
        const invoiceId=+req.params.id
        const {authority}=req.body
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()

        try{
            const time= new Date().toLocaleString('fa-IR').split(',')[1]
            const date= new Date().toLocaleString('fa-IR').split(',')[0]
            const invoice=await this.invoiceRepository.findOne({where:{id:invoiceId},relations:{buyer:{wallet:true,telegram:true},product:true} })
            const newTransaction=this.walletTransaction.create({
                type:"1",
                status:"0",
                wallet:invoice.buyer.wallet,
                authority,
                invoiceId:invoice.invoiceId,
                date,
                time,
                amount:invoice.totalPrice,
                
            })
            

            // const user=await this.userRepository.findOne({where:{id:req.user.id},relations:["telegram"]})
            const admin=await this.adminRepository.findOne({where:{id:req.admin.id}})
    
             if(!invoice || invoice.status!==4){
                if(invoice.status==8){
                    invoice.panelTabel=2
                    console.log("second or more attempt");
                    
                }else{
                    return next(new responseModel(req, res,"درخواست نامعتبر",'create Invoice', 400,"درخواست نامعتبر",null))
                }
             }


             const newAction=this.actionRepository.create({admin,type:1,fromStatus:4,toStatus:6,date,time,invoice})
             invoice.status=6
             invoice.authority=authority
             await queryRunner.manager.save(invoice)
             await queryRunner.manager.save(newAction)
             await queryRunner.manager.save(newTransaction)
             let message
             if(invoice.product.type=="1"){
              
             }else{
                message = `
             <b>کاربر گرامی</b>
             
             پرداخت حواله خرید شما <b>ثبت شد</b> 
             و در حال بررسی می‌باشد:
             
             <b>مشخصات پرداخت:</b>
             • <b>مقدار:</b> ${invoice.coinCount} عدد  
             • <b>نام محصول:</b> ${invoice.product.persianName}  
             • <b>مبلغ:</b> ${invoice.totalPrice.toLocaleString()} تومان  
             • <b>شماره پیگیری حواله:</b> ${invoice.invoiceId}  
             • <b>تاریخ و ساعت:</b> ${date} ${time}  
             • <b>شماره پرداخت:</b> ${authority}
             
             با تشکر از شما.
             `;
             }
            
              message = `
             <b>کاربر گرامی</b>
             
             پرداخت حواله خرید شما <b>ثبت شد</b> 
             و در حال بررسی می‌باشد:
             
             <b>مشخصات پرداخت:</b>
             • <b>مقدار:</b> ${invoice.goldWeight} مثقال  
             • <b>مبلغ:</b> ${invoice.totalPrice.toLocaleString()} تومان  
             • <b>شماره پیگیری حواله:</b> ${invoice.invoiceId}  
             • <b>تاریخ و ساعت:</b> ${date} ${time}  
             • <b>شماره پرداخت:</b> ${authority}
             
             با تشکر از شما.
             `;
             
             this.bot.sendMessage(invoice.buyer.telegram.chatId, message, { parse_mode: 'HTML' });
             await queryRunner.commitTransaction()
             return next(new responseModel(req, res,null,' user invoice', 200,null,invoice))
        }catch(err){
            await queryRunner.rollbackTransaction()
            console.log("error",err);
            return next(new responseModel(req, res,"خطای داخلی سیستم",'invoice', 500,"خطای داخلی سیستم",null))
        }finally{
            console.log('transaction released')
            await queryRunner.release()
        }
    }
    



    async rejectPaymentBuy(req: Request, res: Response, next: NextFunction){
        const id=+req.params.id
        const {description}  =req.body
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()
        const time= new Date().toLocaleString('fa-IR').split(',')[1]
         const date= new Date().toLocaleString('fa-IR').split(',')[0]
        try{
            const admin=await this.adminRepository.findOne({where:{id:req.admin.id}})
            const invoice=await this.invoiceRepository.findOne({where:{id},relations:{buyer:{telegram:true,wallet:true},admins:true,product:true}})
            const walletTransaction=await this.walletTransaction.findOne({where:{authority:invoice.authority}})
            if(!invoice){
                return  next(new responseModel(req, res," وجود ندارد",'reject', 402," وجود ندارد",null))
            }
    
            const newAction=this.actionRepository.create({admin,type:2,fromStatus:6,toStatus:8,date,time,invoice})
    
            invoice.status=8
            invoice.panelTabel=2
            invoice.accounterDescription=description
            invoice.admins=[...invoice.admins,admin]

            walletTransaction.status="2"
    
            await queryRunner.manager.save(walletTransaction)
            await queryRunner.manager.save(invoice)
            await queryRunner.manager.save(newAction)
            
            let message



            if(invoice.product.type=="1"){
                message = `
                <b>کاربر گرامی</b>
                
                پرداخت حواله خرید شما <b>رد شد</b>:
                
                <b>مشخصات حواله:</b>
                * <b>نام:</b> ${invoice.product.persianName} 
                * <b>تعداد:</b> ${invoice.coinCount} عدد  
                * <b>مبلغ:</b> ${invoice.totalPrice.toLocaleString()} تومان  
                * <b>شماره پیگیری:</b> ${invoice.invoiceId}  
                * <b>تاریخ و ساعت:</b> ${date} ${time}
                
                <b>توضیحات:</b>
                ${description}
                `;

            }else{
                message = `
                <b>کاربر گرامی</b>
                
                پرداخت حواله خرید شما <b>رد شد</b>:
                
                <b>مشخصات حواله:</b>
                * <b>مقدار:</b> ${invoice.goldWeight} مثقال  
                * <b>مبلغ:</b> ${invoice.totalPrice.toLocaleString()} تومان  
                * <b>شماره پیگیری:</b> ${invoice.invoiceId}  
                * <b>تاریخ و ساعت:</b> ${date} ${time}
                
                <b>دلیل رد شدن:</b>
                ${description}
                `;
            }

            

         
          
            this.bot.sendMessage(invoice.buyer.telegram.chatId,message,{parse_mode:"HTML"})
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
            const invoice=await this.invoiceRepository.findOne({where:{id:invoiceId},relations:{seller:{telegram:true,wallet:true},admins:true,product:true}})
            const newAction=this.actionRepository.create({admin,type:2,fromStatus:invoice.status,toStatus:5,date,time,invoice})

            if(!invoice || invoice.status!==4){
                if(invoice.status==6){
                  console.log("second attempt or more");
                  
                }else{
                return next(new responseModel(req, res,"درخواست نامعتبر",'invoice', 400,"درخواست نامعتبر",null))}
                
            }

            const bankAccount=this.bankRepository.create({owner:invoice.seller,shebaNumber,name:bankName,ownerName})
            invoice.bankAccount=bankAccount
            invoice.admins=[...invoice.admins,admin]
            invoice.status=5
            
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
            await queryRunner.manager.save(newAction)
            // await queryRunner.manager.save(walletTransaction)

            let message



            if(invoice.product.type=="1"){
                message = `
                <b>کاربر گرامی</b>
                
                پرداخت حواله خرید شما <b>رد شد</b>:
                
                <b>مشخصات حواله:</b>
                * <b>نام:</b> ${invoice.product.persianName} 
                * <b>تعداد:</b> ${invoice.coinCount} عدد  
                * <b>مبلغ:</b> ${invoice.totalPrice.toLocaleString()} تومان  
                * <b>شماره پیگیری:</b> ${invoice.invoiceId}  
                * <b>تاریخ و ساعت:</b> ${date} ${time}
                
                  * <b> شماره شبا:</b> ${shebaNumber} 
            * <b>نام بانک:</b> ${bankName} 
            * <b>صاحب حساب:</b> ${ownerName} 
             
           
             در صورت اشتباه بودن اطلاعات دکمه <b>عدم تایید</b> را بزنید
             در صورت درست بودن اطلاعات دکمه <b>تایید</b> را بزنید
              
                `;

            }else{
                message = `
                <b>کاربر گرامی</b>
                
                  دریافت اطلاعات بانکی شما <b>انجام شد</b>:
                
                <b>مشخصات حواله:</b>
                * <b>مقدار:</b> ${invoice.goldWeight} مثقال  
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
            }

          
          
            
          
           
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
            const invoice=await this.invoiceRepository.findOne({where:{id:id},relations:{seller:{telegram:true,wallet:true},admins:true,product:true}})
            const invoiceTotalPrice = parseFloat(invoice.totalPrice.toString());
            const sellerBalance = parseFloat(invoice.seller.wallet.balance.toString());

            if(!invoice || invoice.status!==7){
                return next(new responseModel(req, res,"تراکتش نامعتبر",'invoice', 400,"تراکتش نامعتبر",null))
            }
            const newAction=this.actionRepository.create({admin,type:2,fromStatus:7,toStatus:9,date,time,invoice})
            invoice.seller.wallet.balance = Math.round(sellerBalance - invoiceTotalPrice);
            invoice.admins=[...invoice.admins,admin]
            invoice.authority=authority
            invoice.status=9
            invoice.panelTabel=3
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
            await queryRunner.manager.save(newAction)


            let message



            if(invoice.product.type=="1"){
                message = `
                <b>کاربر گرامی</b>
                
                 پرداخت حواله فروش شما <b>انجام شد</b>:
                
                <b>مشخصات حواله:</b>
                * <b>نام:</b> ${invoice.product.persianName} 
                * <b>تعداد:</b> ${invoice.coinCount} عدد  
                * <b>مبلغ:</b> ${invoice.totalPrice.toLocaleString()} تومان  
                * <b>شماره پیگیری:</b> ${invoice.invoiceId}  
                * <b>تاریخ و ساعت:</b> ${date} ${time}
                
                <b>توضیحات</b>
               ${description}
              
              
              `;
            

            }else{
                message = `
                <b>کاربر گرامی</b>
              
              پرداخت حواله فروش شما <b>انجام شد</b>:
              
              <b>مشخصات حواله:</b>
              * <b>مقدار:</b> ${invoice.goldWeight} مثقال  
              * <b>مبلغ:</b> ${invoice.totalPrice.toLocaleString()} تومان  
              * <b>شماره پیگیری:</b> ${invoice.invoiceId}  
              * <b>تاریخ و ساعت:</b> ${date} ${time}
              * <b>شناسه پرداخات:</b> ${authority} 
              
              <b>توضیحات</b>
               ${description}
              
              
              `;
            }

            
  
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
            
            const newAction=this.actionRepository.create({admin,type:2,fromStatus:7,toStatus:8,date,time,invoice})

            invoice.seller.wallet.balance = Math.round(sellerBalance - invoiceTotalPrice);
            invoice.admins=[...invoice.admins,admin]
            invoice.accounterDescription=description
            invoice.status=8
            invoice.panelTabel=4

            
            // await queryRunner.manager.save(bankAccount)
            await queryRunner.manager.save(invoice)
            await queryRunner.manager.save(invoice.seller.wallet)
            await queryRunner.manager.save(newAction)
            const message = `
            <b>کاربر گرامی</b>
          
          پرداخت حواله فروش شما <b>لغو شد</b>:
          
          <b>مشخصات حواله:</b>
          * <b>مقدار:</b> ${invoice.goldWeight} مثقال  
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
        
        const invoices=await this.invoiceRepository.find({where:{panelTabel:3},relations:["buyer","bankAccount","appBankAccount","admins","deliveries","product","seller"]})
        return next(new responseModel(req, res,null, 'admin', 200, null, invoices))
    }


  
    async  delivery(req: Request, res: Response, next: NextFunction){
         const id=+req.params.id
         let {type,amount,destUserId,description}=req.body

         amount=formatGoldWeight(amount)

         console.log(req.body);
         
         const queryRunner = AppDataSource.createQueryRunner()
         await queryRunner.connect()
         await queryRunner.startTransaction()
         const time= new Date().toLocaleString('fa-IR').split(',')[1]
         const date= new Date().toLocaleString('fa-IR').split(',')[0]
         
         try{
            const admin=await this.adminRepository.findOne({where:{id:req.admin.id}})
            const invoice=await this.invoiceRepository.findOne({where:{id:id},relations:{buyer:{telegram:true,wallet:true},admins:true}})
            

            if(!invoice || invoice.status!==7){
                if(invoice.status==9){
                   console.log("part delivery");
                   
                }else{
                    return next(new responseModel(req, res,"تراکتش نامعتبر",'invoice', 400,"تراکتش نامعتبر",null))
                }
            }

        let newDelivery
        let destUser
        let newAction
        if(type==1){
            newDelivery=this.deliveryRepository.create({
                type,
                date,
                time,
                mainUser:invoice.buyer,
                description,
                invoice,
                goldWeight:parseFloat(amount)
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
                goldWeight:parseFloat(amount)
              })

              destUser.wallet.goldWeight=destUserGoldWeight+parseFloat(amount)

        }
         
        const buyerGoldWeight=parseFloat(invoice.buyer.wallet.goldWeight.toString())
        console.log(buyerGoldWeight);
        
        const invoiceGold=parseFloat(invoice.remainGoldWeight.toString())

        console.log("amount",amount);
        
        console.log("invoiceWe",invoiceGold);
        
        const walletBuyerRemain=buyerGoldWeight-parseFloat(amount)

        if(walletBuyerRemain<0){
            return next(new responseModel(req, res,"","مقدار طلا کافی نمی باشد", 400,"مقدار طلا کافی نمی باشد",null))
        }

        invoice.buyer.wallet.goldWeight=walletBuyerRemain
        const remain=invoiceGold-amount
        console.log("remainnnn",remain);
        
        invoice.remainGoldWeight=invoiceGold-amount

        if(remain<0){
            return next(new responseModel(req, res,"",'مقدار طلا سفارش کافی نمی باشد', 400,"مقدار طلا سفارش کافی نمی باشد",null))
        }

        if(remain>0){
            invoice.status=9
             newAction=this.actionRepository.create({admin,type:2,fromStatus:invoice.status,toStatus:8,date,time,invoice})
        }else{
            invoice.status=10
            newAction=this.actionRepository.create({admin,type:2,fromStatus:invoice.status,toStatus:9,date,time,invoice})
        }

        invoice.admins=[...invoice.admins,admin]



        await queryRunner.manager.save(invoice)
        await queryRunner.manager.save(invoice.buyer.wallet)
        await queryRunner.manager.save(newAction)
        if(type==2){
            await queryRunner.manager.save(destUser.wallet)
        }
        
        await queryRunner.manager.save(newDelivery)

        
        let message
        let messageDest
        if(type==1){
             message=`<b>کاربر گرامی</b>
        
        تحویل حواله خرید شما <b>انجام شد</b>:
        
        <b>مشخصات تحویل:</b>
        * <b> مقدار تحویل داده شده:</b> ${amount} مثقال  
        * <b>مقدار باقی مانده از این سفارش:</b> ${remain} مثقال  
        * <b>شماره پیگیری:</b> ${invoice.invoiceId}  
        * <b>تاریخ و ساعت:</b> ${date} ${time}
        
        <b>توضیحات:</b>
        ${description}`
        }else{
        //     message=`<b>کاربر گرامی</b>
        
        //         خواندن طلای شما <b>انجام شد</b>:
            
        //      <b>مشخصات تحویل:</b>
        //     * <b> مقدار تحویل داده شده:</b> ${amount} مثقال  
        //     * <b>مقدار باقی مانده از این سفارش:</b> ${remain} مثقال  
        //     * <b> شخص گیرنده:</b> ${destUser.firstName} ${destUser.lastName} مثقال  
        //     * <b>شماره پیگیری:</b> ${invoice.invoiceId}  
        //     * <b>تاریخ و ساعت:</b> ${date} ${time}
            
        //     <b>توضیحات:</b>
        //     ${description}`

        //     messageDest=`<b>کاربر گرامی</b>
        
        //      طلای برای شما <b>خوانده شد</b>:
        
        //  <b>مشخصات تحویل:</b>
        // * <b> مقدار تحویل داده شده:</b> ${amount} مثقال  
        // * <b> شخص انتقال دهنده:</b> ${invoice.buyer.firstName} ${invoice.buyer.lastName} مثقال  
        // * <b>تاریخ و ساعت:</b> ${date} ${time}
        
        // <b>توضیحات:</b>
        // ${description}`

        // this.bot.sendMessage(destUser.telegram.chatId,messageDest,{parse_mode:"HTML"})
        }
        this.bot.sendMessage(invoice.buyer.telegram.chatId,message,{parse_mode:"HTML"})
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

    async sellDelivery(req: Request, res: Response, next: NextFunction){
        const id=+req.params.id
        let {amount,description}=req.body
        
        amount=formatGoldWeight(amount)

        console.log(req.body);
        
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()
        const time= new Date().toLocaleString('fa-IR').split(',')[1]
        const date= new Date().toLocaleString('fa-IR').split(',')[0]
        
        try{
           const admin=await this.adminRepository.findOne({where:{id:req.admin.id}})
           const invoice=await this.invoiceRepository.findOne({where:{id:id},relations:{seller:{telegram:true,wallet:true},admins:true}})
           

           if(!invoice || invoice.status!==9){
               if(invoice.status==10){
                  console.log("part delivery");
                  
               }else{
                   return next(new responseModel(req, res,"تراکتش نامعتبر",'invoice', 400,"تراکتش نامعتبر",null))
               }
           }

       let newDelivery
       let destUser
       let newAction
       
           newDelivery=this.deliveryRepository.create({
               type:"1",
               date,
               time,
               mainUser:invoice.seller,
               description,
               invoice,
               goldWeight:parseFloat(amount)
             })
           
       
        
  
       
       const invoiceGold=parseFloat(invoice.remainGoldWeight.toString())
       console.log("amount",amount);
       console.log("invoiceWe",invoiceGold);
       
    //    const walletBuyerRemain=buyerGoldWeight-parseFloat(amount)

    //    if(walletBuyerRemain<0){
    //        return next(new responseModel(req, res,"","مقدار طلا کافی نمی باشد", 400,"مقدار طلا کافی نمی باشد",null))
    //    }

    //    invoice.seller.wallet.goldWeight=walletBuyerRemain
       const remain=invoiceGold-amount
       console.log("remainnnn",remain);
       
       invoice.remainGoldWeight=invoiceGold-amount

       if(remain<0){
           return next(new responseModel(req, res,"",'مقدار طلا سفارش کافی نمی باشد', 400,"مقدار طلا سفارش کافی نمی باشد",null))
       }

       if(remain>0){
           invoice.status=10
            newAction=this.actionRepository.create({admin,type:2,fromStatus:invoice.status,toStatus:10,date,time,invoice})
       }else{
           invoice.status=11
           newAction=this.actionRepository.create({admin,type:2,fromStatus:invoice.status,toStatus:11,date,time,invoice})
       }

       invoice.admins=[...invoice.admins,admin]



       await queryRunner.manager.save(invoice)
       await queryRunner.manager.save(newAction)
       await queryRunner.manager.save(newDelivery)

       
       
      
      
       const  message=`<b>کاربر گرامی</b>
       
       تحویل حواله فروش شما <b>انجام شد</b>:
       
       <b>مشخصات تحویل:</b>
       * <b> مقدار تحویل داده شده:</b> ${amount} مثقال  
       * <b>مقدار باقی مانده از این سفارش:</b> ${remain} مثقال  
       * <b>شماره پیگیری:</b> ${invoice.invoiceId}  
       * <b>تاریخ و ساعت:</b> ${date} ${time}
       
       <b>توضیحات:</b>
       ${description}`
      
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



    async coinDelivery(req: Request, res: Response, next: NextFunction){
        const id=+req.params.id
        let {type,amount,destUserId,description}=req.body


        amount=formatGoldWeight(amount)

        console.log(req.body);
        
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()
        const time= new Date().toLocaleString('fa-IR').split(',')[1]
        const date= new Date().toLocaleString('fa-IR').split(',')[0]
        
        try{
           const admin=await this.adminRepository.findOne({where:{id:req.admin.id}})
           const invoice=await this.invoiceRepository.findOne({where:{id:id},relations:{buyer:{telegram:true,wallet:{coins:{product:true}}},admins:true,product:true}})
           

           if(!invoice || invoice.status!==7){
               if(invoice.status==9){
                  console.log("part delivery");
                  
               }else{
                   return next(new responseModel(req, res,"تراکتش نامعتبر",'invoice', 400,"تراکتش نامعتبر",null))
               }
           }

       let newDelivery
       let destUser
       let newAction
       if(type==1){
           newDelivery=this.deliveryRepository.create({
               type,
               date,
               time,
               mainUser:invoice.buyer,
               description,
               invoice,
               coinCount:amount
             })
           
       }else{
           destUser=await  this.userRepository.findOne({where:{id:destUserId},relations:{wallet:{coins:{product:true}},telegram:true}})
           const destCoins = destUser.wallet.coins
           const invoiceProduct=invoice.product
           const coinCount=amount
           const index=destCoins.findIndex(item=>item.product.id==invoiceProduct.id)
           console.log("desuser",index);
         
 
        if(index==-1){
            console.log("heeerrrr");
            const newItem=this.coinWalletRepository.create({count:coinCount,wallet:destUser.wallet,product:invoice.product})
            console.log(newItem);
            
            await queryRunner.manager.save(newItem)
        }else{
            const item=destCoins[index]
            console.log("item",item);
            
            const newCount=item.count+coinCount
            console.log("newCount",newCount);
            destUser.wallet.coins[index].count=newCount


            console.log("wallet",destUser.wallet);
            await queryRunner.manager.save(destUser.wallet.coins)
            
        }

           newDelivery=this.deliveryRepository.create({
               type,
               date,
               time,
               mainUser:invoice.buyer,
               description,
               invoice,
               destUser,
               coinCount:parseFloat(amount)
             })

             

       }


    
         const coins=invoice.buyer.wallet.coins

         
         console.log("coin",coins[0])

         console.log("productIDf",invoice.product);



         



         const invoiceCoinIndex=coins.findIndex(item=>item.product.id==invoice.product.id)

         console.log("index",invoiceCoinIndex);
         
         
         if(invoiceCoinIndex==-1){
            return next(new responseModel(req, res,"","مقدار سکه کافی نمی باشد", 400,"مقدار سکه کافی نمی باشد",null))
         }

        console.log("itemmmmmm",invoice.buyer.wallet.coins[invoiceCoinIndex]);


        
        

    const updatedbuyerCoinWalletCount=invoice.buyer.wallet.coins[invoiceCoinIndex].count-amount

  

         
         
   
    
    if(updatedbuyerCoinWalletCount<0){
        return next(new responseModel(req, res,"","مقدار طلا کافی نمی باشد", 400,"مقدار طلا کافی نمی باشد",null))
    }
    
       invoice.buyer.wallet.coins[invoiceCoinIndex].count=updatedbuyerCoinWalletCount
      
       const remain=invoice.remainCoinCount-amount
       console.log("remainnnn",remain);
       
       invoice.remainCoinCount=remain

       if(remain<0){
           return next(new responseModel(req, res,"",'مقدار طلا سفارش کافی نمی باشد', 400,"مقدار طلا سفارش کافی نمی باشد",null))
       }

       if(remain>0){
           invoice.status=9
            newAction=this.actionRepository.create({admin,type:2,fromStatus:invoice.status,toStatus:8,date,time,invoice})
       }else{
           invoice.status=10
           newAction=this.actionRepository.create({admin,type:2,fromStatus:invoice.status,toStatus:9,date,time,invoice})
       }

       invoice.admins=[...invoice.admins,admin]



       await queryRunner.manager.save(invoice)
       await queryRunner.manager.save(invoice.buyer.wallet.coins)
       await queryRunner.manager.save(newAction)
       await queryRunner.manager.save(newDelivery)

    //    if(type==2){
    //     await queryRunner.manager.save(destUser.wallet.coins)
    //    }

       
       let message
       let messageDest
       if(type==1){
            message=`<b>کاربر گرامی</b>
       
       تحویل حواله خرید شما <b>انجام شد</b>:
       
       <b>مشخصات تحویل:</b>
       * <b> مقدار تحویل داده شده:</b> ${amount} مثقال  
       * <b>مقدار باقی مانده از این سفارش:</b> ${remain} مثقال  
       * <b>شماره پیگیری:</b> ${invoice.invoiceId}  
       * <b>تاریخ و ساعت:</b> ${date} ${time}
       
       <b>توضیحات:</b>
       ${description}`
       }else{
           message=`<b>کاربر گرامی</b>
       
               خواندن طلای شما <b>انجام شد</b>:
           
            <b>مشخصات تحویل:</b>
           * <b> مقدار تحویل داده شده:</b> ${amount} مثقال  
           * <b>مقدار باقی مانده از این سفارش:</b> ${remain} مثقال  
           * <b> شخص گیرنده:</b> ${destUser.firstName} ${destUser.lastName} مثقال  
           * <b>شماره پیگیری:</b> ${invoice.invoiceId}  
           * <b>تاریخ و ساعت:</b> ${date} ${time}
           
           <b>توضیحات:</b>
           ${description}`

    //        messageDest=`<b>کاربر گرامی</b>
       
    //         طلای برای شما <b>خوانده شد</b>:
       
    //    //  <b>مشخصات تحویل:</b>
    //    // * <b> مقدار تحویل داده شده:</b> ${amount} مثقال  
    //    // * <b> شخص انتقال دهنده:</b> ${invoice.buyer.firstName} ${invoice.buyer.lastName} مثقال  
    //    // * <b>تاریخ و ساعت:</b> ${date} ${time}
       
    //    // <b>توضیحات:</b>
    //    // ${description}`

       // this.bot.sendMessage(destUser.telegram.chatId,messageDest,{parse_mode:"HTML"})
       }
       this.bot.sendMessage(invoice.buyer.telegram.chatId,message,{parse_mode:"HTML"})
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


    async coinSellDelivery(req: Request, res: Response, next: NextFunction){
        const id=+req.params.id
        let {type,amount,destUserId,description}=req.body


        amount=formatGoldWeight(amount)

        console.log(req.body);
        
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()
        const time= new Date().toLocaleString('fa-IR').split(',')[1]
        const date= new Date().toLocaleString('fa-IR').split(',')[0]
        
        try{
           const admin=await this.adminRepository.findOne({where:{id:req.admin.id}})
           const invoice=await this.invoiceRepository.findOne({where:{id:id},relations:{seller:{telegram:true,wallet:{coins:{product:true}}},admins:true,product:true}})
           if(!invoice || invoice.status!==9){
               if(invoice.status==10){
                  console.log("part delivery");
                  
               }else{
                   return next(new responseModel(req, res,"تراکتش نامعتبر",'invoice', 400,"تراکتش نامعتبر",null))
               }
           }

       let newDelivery
       let destUser
       let newAction
       if(type==1){
           newDelivery=this.deliveryRepository.create({
               type,
               date,
               time,
               mainUser:invoice.seller,
               description,
               invoice,
               coinCount:amount
             })
           
       }else{
           destUser=await  this.userRepository.findOne({where:{id:destUserId},relations:{wallet:{coins:{product:true}},telegram:true}})
           const destCoins = destUser.wallet.coins
           const invoiceProduct=invoice.product
           const coinCount=amount
           const index=destCoins.findIndex(item=>item.product.id==invoiceProduct.id)
           console.log("desuser",index);
         
 
        if(index==-1){
            console.log("heeerrrr");
            const newItem=this.coinWalletRepository.create({count:coinCount,wallet:destUser.wallet,product:invoice.product})
            console.log(newItem);
            
            await queryRunner.manager.save(newItem)
        }else{
            const item=destCoins[index]
            console.log("item",item);
            
            const newCount=item.count+coinCount
            console.log("newCount",newCount);
            destUser.wallet.coins[index].count=newCount


            console.log("wallet",destUser.wallet);
            await queryRunner.manager.save(destUser.wallet.coins)
            
        }

           newDelivery=this.deliveryRepository.create({
               type,
               date,
               time,
               mainUser:invoice.seller,
               description,
               invoice,
               destUser,
               coinCount:parseFloat(amount)
             })

             

       }


    
         const coins=invoice.seller.wallet.coins

         
         console.log("coin",coins[0])

         console.log("productIDf",invoice.product);



         



         const invoiceCoinIndex=coins.findIndex(item=>item.product.id==invoice.product.id)

         console.log("index",invoiceCoinIndex);
         
         
         if(invoiceCoinIndex==-1){
            return next(new responseModel(req, res,"","مقدار سکه کافی نمی باشد", 400,"مقدار سکه کافی نمی باشد",null))
         }

        console.log("itemmmmmm",invoice.seller.wallet.coins[invoiceCoinIndex]);


        
        

    const updatedbuyerCoinWalletCount=invoice.seller.wallet.coins[invoiceCoinIndex].count-amount

  

         
         
   
    
    if(updatedbuyerCoinWalletCount<0){
        return next(new responseModel(req, res,"","مقدار طلا کافی نمی باشد", 400,"مقدار طلا کافی نمی باشد",null))
    }
    
       invoice.seller.wallet.coins[invoiceCoinIndex].count=updatedbuyerCoinWalletCount
      
       const remain=invoice.remainCoinCount-amount
       console.log("remainnnn",remain);
       
       invoice.remainCoinCount=remain

       if(remain<0){
           return next(new responseModel(req, res,"",'مقدار طلا سفارش کافی نمی باشد', 400,"مقدار طلا سفارش کافی نمی باشد",null))
       }

       if(remain>0){
           invoice.status=10
            newAction=this.actionRepository.create({admin,type:2,fromStatus:invoice.status,toStatus:10,date,time,invoice})
       }else{
           invoice.status=11
           newAction=this.actionRepository.create({admin,type:2,fromStatus:invoice.status,toStatus:11,date,time,invoice})
       }

       invoice.admins=[...invoice.admins,admin]



       await queryRunner.manager.save(invoice)
       await queryRunner.manager.save(invoice.buyer.wallet.coins)
       await queryRunner.manager.save(newAction)
       await queryRunner.manager.save(newDelivery)

    //    if(type==2){
    //     await queryRunner.manager.save(destUser.wallet.coins)
    //    }

       
       let message
       let messageDest
       if(type==1){
            message=`<b>کاربر گرامی</b>
       
       تحویل حواله خرید شما <b>انجام شد</b>:
       
       <b>مشخصات تحویل:</b>
       * <b> مقدار تحویل داده شده:</b> ${amount} مثقال  
       * <b>مقدار باقی مانده از این سفارش:</b> ${remain} مثقال  
       * <b>شماره پیگیری:</b> ${invoice.invoiceId}  
       * <b>تاریخ و ساعت:</b> ${date} ${time}
       
       <b>توضیحات:</b>
       ${description}`
       }else{
           message=`<b>کاربر گرامی</b>
       
               خواندن طلای شما <b>انجام شد</b>:
           
            <b>مشخصات تحویل:</b>
           * <b> مقدار تحویل داده شده:</b> ${amount} مثقال  
           * <b>مقدار باقی مانده از این سفارش:</b> ${remain} مثقال  
           * <b> شخص گیرنده:</b> ${destUser.firstName} ${destUser.lastName} مثقال  
           * <b>شماره پیگیری:</b> ${invoice.invoiceId}  
           * <b>تاریخ و ساعت:</b> ${date} ${time}
           
           <b>توضیحات:</b>
           ${description}`

    //        messageDest=`<b>کاربر گرامی</b>
       
    //         طلای برای شما <b>خوانده شد</b>:
       
    //    //  <b>مشخصات تحویل:</b>
    //    // * <b> مقدار تحویل داده شده:</b> ${amount} مثقال  
    //    // * <b> شخص انتقال دهنده:</b> ${invoice.buyer.firstName} ${invoice.buyer.lastName} مثقال  
    //    // * <b>تاریخ و ساعت:</b> ${date} ${time}
       
    //    // <b>توضیحات:</b>
    //    // ${description}`

       // this.bot.sendMessage(destUser.telegram.chatId,messageDest,{parse_mode:"HTML"})
       }
       this.bot.sendMessage(invoice.buyer.telegram.chatId,message,{parse_mode:"HTML"})
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



    async getAllDeliveryRequest(req: Request, res: Response, next: NextFunction){
        try{
            const deliveries=await this.deliveryRepository.find({where:{type:"3"}})
            return next(new responseModel(req, res,null, 'admin', 200, null, deliveries)) 
        }catch(err){
            console.log(err);
            return next(new responseModel(req, res,"خطای داخلی سیستم",'invoice', 500,"خطای داخلی سیستم",null))
        }

    }


    async approveDeliveryRequest(req: Request, res: Response, next: NextFunction){
      try{}catch(err){}finally{}
    }


    async rejectDeliveryRequest(req: Request, res: Response, next: NextFunction){
        try{}catch(err){}finally{}
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