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
const token = process.env.TELEGRAM_BOT_TOKEN || "7622536105:AAFR0NDFR27rLDF270uuL5Ww_K0XZi61FCw";

export class AdminController{
    private adminRepository=AppDataSource.getRepository(Admin)
    private accessPointRepository=AppDataSource.getRepository(accessPoint)
    private userRepository=AppDataSource.getRepository(User)
    private jwtService=new JwtGenerator()
    private telegramUserRepository=AppDataSource.getRepository(TelegramUser)
    private invoiceRepository=AppDataSource.getRepository(Invoice)
    private appBankRepository=AppDataSource.getRepository(AppBankAccount)
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
        const invoices=await this.invoiceRepository.find({relations:["buyer","bankAccount","appBankAccount","admins"]})
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





   
    async approveSellInvoice(req: Request, res: Response, next: NextFunction){
         const invoiceId=+req.params.id
         const description=req.body.description
         const queryRunner = AppDataSource.createQueryRunner()
         await queryRunner.connect()
         await queryRunner.startTransaction()
         try{
            const admin=await this.adminRepository.findOne({where:{id:req.admin.id}})
            const invoice=await this.invoiceRepository.findOne({where:{id:invoiceId}})
            invoice.status=1
            invoice.admins=[admin]
            invoice.description=description
            await queryRunner.manager.save(invoice)
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
         try{
            const admin=await this.adminRepository.findOne({where:{id:req.admin.id}})
            const invoice=await this.invoiceRepository.findOne({where:{id:invoiceId}})
            invoice.status=2
            invoice.admins=[admin]
            invoice.description=description

            await queryRunner.manager.save(invoice)
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
           
           invoice.status=1
           invoice.admins=[admin]
           invoice.description=description
           invoice.appBankAccount=appBank
           await queryRunner.manager.save(invoice)
           await queryRunner.commitTransaction()
           

            const time= new Date().toLocaleString('fa-IR').split(',')[1]
            const date= new Date().toLocaleString('fa-IR').split(',')[0]

           
            const message= `کاربر گرامی،/n
/n
درخواست حواله خرید شما به مقدار **${invoice.goldWeight}**/n
به مبلغ **${invoice.totalPrice}**/n
به شماره پیگیری **${invoice.invoiceId}**/n
در تاریخ و ساعت **${date} ${time}** تایید شد./n
/n
لطفا مبلغ حواله را به این حساب واریز کرده و اطلاعات واریز را وارد نمایید:/n
/n
- **شماره شبا:** ${appBank.shebaNumber}/n
- **شماره کارت:** ${appBank.cardNumber}/n
- **بانک:** ${appBank.name}/n
            - **به نام:** ${appBank.ownerName}/n`
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
           const invoice=await this.invoiceRepository.findOne({where:{id:invoiceId}})
           const telegramUser=await this.telegramUserRepository.findOne({where:{user:{id:invoice.buyer.id}}})
           invoice.status=2
           invoice.admins=[admin]
           invoice.description=description

           const time= new Date().toLocaleString('fa-IR').split(',')[1]
            const date= new Date().toLocaleString('fa-IR').split(',')[0]
           await queryRunner.manager.save(invoice)
           await queryRunner.commitTransaction()
           const message= `کاربر گرامی،/n
           /n
           درخواست حواله خرید شما به مقدار **${invoice.goldWeight}**/n
           به مبلغ **${invoice.totalPrice}**/n
           به شماره پیگیری **${invoice.invoiceId}**/n
           در تاریخ و ساعت **${date} ${time}** رد شد./n
           /n
           به دلیل /n
           ${description}
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

    private  generateOTP(limit) {          
        var digits = '0123456789';
        let OTP = '';
        for (let i = 0; i < limit; i++ ) {
            OTP += digits[Math.floor(Math.random() * 10)];
        }
        return OTP;
    }

    


}