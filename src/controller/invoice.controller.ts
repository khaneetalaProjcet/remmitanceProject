import { AppDataSource } from "../data-source";
import { Request, Response,NextFunction, query } from "express";
import {Invoice} from "../entity/Invoice"
import {goldPriceService} from "../services/goldPrice.service"
import { responseModel } from "../utills/response.model";
import { User } from "../entity/User";
import {Prices}  from "../entity/Prices"
import {formatGoldWeight} from "../utills/HelperFunctions"
import { validationResult } from "express-validator";
import {settingService} from "../services/setting.service"
import { BankAccount } from "../entity/BankAccount";
import {showMainMenu} from "../services/telegramBot/menu"
import {WalletTransaction}   from "../entity/WalletTransaction"
import { Actions } from "../entity/Actions";
import TelegramBot from 'node-telegram-bot-api';
const token = process.env.TELEGRAM_BOT_TOKEN|| "7622536105:AAFR0NDFR27rLDF270uuL5Ww_K0XZi61FCw";


export class InvoiceController{

    private invoiceRepository=AppDataSource.getRepository(Invoice)
    private userRepository=AppDataSource.getRepository(User)
    private bankAccountRepository=AppDataSource.getRepository(BankAccount)
    private pricesRepository=AppDataSource.getRepository(Prices)
    private walletTransaction=AppDataSource.getRepository(WalletTransaction)
    private actionsRepository=AppDataSource.getRepository(Actions)
    private goldPriceService=new goldPriceService()
    private settingService=new settingService()
    private bot=new TelegramBot(token);

    private  generateInvoice(){
        return (new Date().getTime()).toString()
    }

    async createInvoice(req: Request, res: Response, next: NextFunction){
        let { goldPrice, goldWeight, type, totalPrice } = req.body;
        const bodyError = validationResult(req)
        if (!bodyError.isEmpty()) {
          return next(new responseModel(req, res,bodyError['errors'][0].msg,'invoice',400,bodyError['errors'][0].msg ,null))
        }   
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()
        try{
            const setting=await this.settingService.getSetting()
            const max=(type==0)?setting.maxTradeSell:setting.maxTradeBuy
            const min=(type==0)?setting.minTradeSell:setting.minTradeBuy
            

            const isOpen=setting.tradeIsOpen
            

          
            
 
            console.log(max,min);
            
            const prices=await this.goldPriceService.getGoldPrice()
            const realGoldprice=(type==0)?prices.sellPrice:prices.buyPrice
            
            const realTotalrice=realGoldprice*(+goldWeight)
            if(!isOpen){
                return next(new responseModel(req, res,"معاملات تا اطلاع ثانوی بسته می باشد",'create Invoice', 400,"معاملات تا اطلاع ثانوی بسته می باشد",null))
            }
            if (realGoldprice - (+goldPrice) >= 10000){
                console.log('condition1')
                goldPrice = realGoldprice
                // return response.status(400).json({ msg: 'امکان ثبت معامله در این قیمت وجود ندارد' });
            }
            if ((realTotalrice - (+totalPrice)) >= (10*(+goldWeight))){
                console.log('condition2')
                totalPrice = realTotalrice
                // return response.status(400).json({ msg: 'امکان ثبت معامله در این قیمت وجود ندارد' });
            }   
            console.log('weight>>>' , (realTotalrice) , totalPrice)
            // console.log('total' , totalPrice , typeof(totalPrice))
            if ((totalPrice.toString()).split('').length > 10){
                // return response.status(400).json({ msg: 'مبلغ بیش از حد مجاز' });
                return next(new responseModel(req, res,'مبلغ بیش از حد مجاز' ,'create Invoice', 400,'مبلغ بیش از حد مجاز' ,null))
            }
            if ( +goldWeight < 0.01){
                // return response.status(400).json({ msg: 'میزان طلای درخاستی نمی تواند کمتر از 0.01 باشد' });
                return next(new responseModel(req, res,'میزان طلای درخاستی نمی تواند کمتر از 0.01 باشد'  ,'create Invoice', 400,'میزان طلای درخاستی نمی تواند کمتر از 0.01 باشد'  ,null))
            }
            if (goldWeight == '0' || goldPrice == '0' || totalPrice == '0' ){
                // return response.status(400).json({ msg: 'لطفا مقادیر درست را وارد کنید' });
                return next(new responseModel(req, res,'لطفا مقادیر درست را وارد کنید' ,'create Invoice', 400,'لطفا مقادیر درست را وارد کنید' ,null))
            }
            


            const user=await this.userRepository.findOne({where:{id:req.user.id},relations:["telegram"]})
            if(!user){
                return next(new responseModel(req, res,"کاربر پیدا نشد",'create Invoice', 400,"کاربر پیدا نشد",null))
            }
            if(!user.telegram){
                return next(new responseModel(req, res,"کاربر در ربات تلگرام پیدا نشد",'create Invoice', 400,"کاربر در ربات تلگرام پیدا نشد",null))
            }
            // const userBankAccount : BankAccount=await this.bankAccountRepository.findOne({where:{isActive:true,owner:{id:req.user.id}}})
            // if(!userBankAccount){
            //     return next(new responseModel(req, res,"حساب بانکی یافت نشد",'create Invoice', 400,"حساب بانکی یافت نشد",null))
            // }

            // console.log("user log Bank",userBankAccount);
            console.log('body>>>>>' , goldPrice, goldWeight, type, totalPrice )
            goldWeight = formatGoldWeight(goldWeight)
            const time= new Date().toLocaleString('fa-IR').split(',')[1]
            const date= new Date().toLocaleString('fa-IR').split(',')[0]
            if(goldWeight<min||goldWeight>max){
                return next(new responseModel(req, res,'لطفا مقدار وزن طلا را تغییر دهید','create Invoice', 400,'لطفا مقدار وزن طلا را تغییر دهید' ,null))
            }
            console.log('start the transaction',goldWeight)
            const invoiceId= this.generateInvoice()
            let transaction = this.invoiceRepository.create({                                    // here is the making the transActions
                goldPrice: parseFloat(goldPrice),
                goldWeight: parseFloat(goldWeight),
                totalPrice: Math.floor(+totalPrice),
                seller: type === 1 ? null : user,
                buyer: type === 1 ? user :null,
                type,
                invoiceId,
                // bankAccount:userBankAccount,
                time,
                date,
            });

            await queryRunner.manager.save(transaction)
            await queryRunner.commitTransaction()
            let message
            if(type==0){
                message=  `کاربر گرامی درخواست حواله فروش شما
                                                      به مقدار
                                                  ${goldWeight}
                                                      به مبلغه 
                                                 ${totalPrice}
                                               به شماره فاکتور
                                                  ${invoiceId}
                                               در تاریخ و ساعت 
                                           ${date + " "+ time}
                                 ثبت شد و در حال بررسی می باشد  
                `
            }else{ 
                 message=  `کاربر گرامی درخواست حواله خرید شما
                                                      به مقدار
                                                  ${goldWeight}
                                                      به مبلغه 
                                                 ${totalPrice}
                                               به شماره فاکتور
                                                  ${invoiceId}
                                               در تاریخ و ساعت 
                                           ${date + " "+ time}
                                 ثبت شد و در حال بررسی می باشد  
                `
                


            }
            showMainMenu(this.bot,user.telegram.chatId,message)
            return next(new responseModel(req, res,null,'create Invoice', 200,null,transaction))
            
        }catch(err){
            await queryRunner.rollbackTransaction()
            console.log("error",err);
            return next(new responseModel(req, res,"خطای داخلی سیستم",'invoice', 500,"خطای داخلی سیستم",null))

        }finally{
            console.log('transaction released')
            await queryRunner.release()
        }



    }


    async getAllInvoiceForUser(req: Request, res: Response, next: NextFunction){
        
        const all=await this.invoiceRepository.find({where:[
            {seller:{id:req.user.id}},
            {buyer:{id:req.user.id}}
        ],relations:["seller","buyer","bankAccount","appBankAccount","product"],order:{id:"DESC"}})


        return next(new responseModel(req, res,null,' user invoice', 200,null,all))

    }


    async getOneInvoice(req: Request, res: Response, next: NextFunction){
        const id=+req.params.id
        try{
            const invoice=await this.invoiceRepository.findOne({where:{
                id:id
            },relations:["seller","buyer","bankAccount","appBankAccount"]})
            if((invoice.type==0&&invoice.seller.id!=req.user.id)||(invoice.type==1&&invoice.buyer.id!=req.user.id)){
                return next(new responseModel(req, res,"کاربر اجازه دسترسی ندارد",'invoice', 403,"کاربر اجازه دسترسی ندارد",null))
            }
            
            return next(new responseModel(req, res,null,' user invoice', 200,null,invoice))
        }catch(err){
            return next(new responseModel(req, res,"خطای داخلی سیستم",'invoice', 500,"خطای داخلی سیستم",null))
        }

    }

    async getAllInvoiceForUserFilter(req: Request, res: Response, next: NextFunction){
       const {status , type} =req.body
       console.log("body",req.body);
       
       const queryBuilder = this.invoiceRepository.createQueryBuilder('invoice')
       .leftJoinAndSelect('invoice.buyer', 'buyer')
       .leftJoinAndSelect('invoice.seller', 'seller')
       .leftJoin('invoice.bankAccount',"bankAccount")
       .leftJoin('invoice.product',"product")
       .leftJoin('invoice.appBankAccount',"appBankAccount")

       if(type=="0"){
         queryBuilder.andWhere('seller.id = :userId',{userId:req.user.id})
       }
       if(type=="1"){
        queryBuilder.andWhere('buyer.id = :userId',{userId:req.user.id})
       }    
       


       if(status=="0"){
           queryBuilder.andWhere('invoice.status = :status ', { status:0 })
       }
       if(status){
           queryBuilder.andWhere('invoice.status = :status', { status:+status })
       }
      

   


    
       const invoices = await queryBuilder
       .orderBy('invoice.createdAt', 'DESC')
       .getMany();
        

    //    console.log("invoiecs",invoices);
       
       return next(new responseModel(req, res,null,' user invoice', 200,null,invoices))
    }


   
    async payBuyApproveRequest(req: Request, res: Response, next: NextFunction){
        const invoiceId=+req.params.id
        const {authority}=req.body
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()

        try{
            const time= new Date().toLocaleString('fa-IR').split(',')[1]
            const date= new Date().toLocaleString('fa-IR').split(',')[0]
            const invoice=await this.invoiceRepository.findOne({where:{id:invoiceId},relations:{buyer:{wallet:true}} })
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
            

            const user=await this.userRepository.findOne({where:{id:req.user.id},relations:["telegram"]})
    
    
             if(!invoice || invoice.status!==4){
                if(invoice.status==8){
                    invoice.panelTabel=2
                    console.log("second or more attempt");
                    
                }else{
                    return next(new responseModel(req, res,"درخواست نامعتبر",'create Invoice', 400,"درخواست نامعتبر",null))
                }
             }


             const newAction=this.actionsRepository.create({user,type:1,fromStatus:4,toStatus:6,date,time,invoice})
             invoice.status=6
             invoice.authority=authority
             await queryRunner.manager.save(invoice)
             await queryRunner.manager.save(newAction)
             await queryRunner.manager.save(newTransaction)
            
            
             const message = `
             <b>کاربر گرامی</b>
             
             پرداخت حواله خرید شما <b>ثبت شد</b> 
             و در حال بررسی می‌باشد:
             
             <b>مشخصات پرداخت:</b>
             • <b>مقدار:</b> ${invoice.goldWeight} گرم  
             • <b>مبلغ:</b> ${invoice.totalPrice.toLocaleString()} تومان  
             • <b>شماره پیگیری حواله:</b> ${invoiceId}  
             • <b>تاریخ و ساعت:</b> ${date} ${time}  
             • <b>شماره پرداخت:</b> ${authority}
             
             با تشکر از شما.
             `;
             
             this.bot.sendMessage(user.telegram.chatId, message, { parse_mode: 'HTML' });
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


    async cancelBuyRequest(req: Request, res: Response, next: NextFunction){
        const invoiceId=+req.params.id
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()
        
        try{
            const invoice=await this.invoiceRepository.findOne({where:{id:invoiceId},relations:["buyer"] })
            const user=await this.userRepository.findOne({where:{id:req.user.id},relations:["telegram"]})
      
            
            const time= new Date().toLocaleString('fa-IR').split(',')[1]
            const date= new Date().toLocaleString('fa-IR').split(',')[0]
    
    
            if(!invoice || invoice.status!==3){
                return next(new responseModel(req, res,"درخواست نامعتبر",'create Invoice', 400,"درخواست نامعتبر",null))
             }
            
            invoice.status=3
            invoice.panelTabel=4
            const newAction=this.actionsRepository.create({user,type:1,fromStatus:4,toStatus:3,date,time,invoice})
    
            await queryRunner.manager.save(invoice)
            await queryRunner.manager.save(newAction)
            const message = `
            <b>کاربر گرامی</b>
            
            پرداخت حواله خرید شما توسط شما <b>لغو شد</b>:
            
            <b>مشخصات حواله:</b>
            • <b>مقدار:</b> ${invoice.goldWeight} گرم  
            • <b>مبلغ:</b> ${invoice.totalPrice.toLocaleString()} تومان  
            • <b>شماره پیگیری:</b> ${invoiceId}  
            • <b>تاریخ و ساعت:</b> ${date} ${time}
            
            در صورت نیاز می‌توانید مجدداً اقدام نمایید.
            `;
           this.bot.sendMessage(user.telegram.chatId, message, { parse_mode: 'HTML' });
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


    async createNewInvoice(req: Request, res: Response, next: NextFunction){
        let { goldPrice, goldWeight, type, totalPrice,priceId,description} = req.body;

        console.log("req.bodyyyyyyyy",req.body);
        
        // const bodyError = validationResult(req)
        // if (!bodyError.isEmpty()) {
        //   return next(new responseModel(req, res,bodyError['errors'][0].msg,'invoice',400,bodyError['errors'][0].msg ,null))
        // }   
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()
        try{
            // const setting=await this.settingService.getSetting()
            // const max=(type==0)?setting.maxTradeSell:setting.maxTradeBuy
            // const min=(type==0)?setting.minTradeSell:setting.minTradeBuy
            
            // const isTradeOpen=setting.tradeIsOpen

            const setting=await this.settingService.getSetting()
            const max=(type==0)?setting.maxTradeSell:setting.maxTradeBuy
            const min=(type==0)?setting.minTradeSell:setting.minTradeBuy

            const maxCoin=(type==0)?setting.maxSellCoin:setting.maxBuyCoin
            const minCoin=(type==0)?setting.minCoin:setting.minCoin

            const isOpen=setting.tradeIsOpen
            

          
            
 
            console.log(max,min);

            // console.log(`min : ${min} max : ${max}` );
            

           
            const prices=await this.pricesRepository.findOne({where:{id:+priceId}})

            if(prices.type=="0"){
                console.log("prices",prices);
            
                const realGoldprice=(type==0)?+prices.sellPrice:+prices.buyPrice
                const isHave=(type==0)?prices.haveSell:prices.haveBuy
                
                const realTotalrice=realGoldprice*(+goldWeight)
                if(!isOpen){
                    return next(new responseModel(req, res,"معاملات تا اطلاع ثانوی بسته می باشد",'create Invoice', 400,"معاملات تا اطلاع ثانوی بسته می باشد",null))
                }
    
                if (realGoldprice - (+goldPrice) >= 10000){
                    console.log('condition1')
                    goldPrice = realGoldprice
                    // return response.status(400).json({ msg: 'امکان ثبت معامله در این قیمت وجود ندارد' });
                }
                if ((realTotalrice - (+totalPrice)) >= (10*(+goldWeight))){
                    console.log('condition2')
                    totalPrice = realTotalrice
                    // return response.status(400).json({ msg: 'امکان ثبت معامله در این قیمت وجود ندارد' });
                }   
                console.log('weight>>>' , (realTotalrice) , totalPrice)
                // console.log('total' , totalPrice , typeof(totalPrice))
                if ((totalPrice.toString()).split('').length > 10){
                    // return response.status(400).json({ msg: 'مبلغ بیش از حد مجاز' });
                    return next(new responseModel(req, res,'مبلغ بیش از حد مجاز' ,'create Invoice', 400,'مبلغ بیش از حد مجاز' ,null))
                }
                if ( +goldWeight < 0.01){
                    // return response.status(400).json({ msg: 'میزان طلای درخاستی نمی تواند کمتر از 0.01 باشد' });
                    return next(new responseModel(req, res,'میزان طلای درخاستی نمی تواند کمتر از 0.01 باشد'  ,'create Invoice', 400,'میزان طلای درخاستی نمی تواند کمتر از 0.01 باشد'  ,null))
                }
                if (goldWeight == '0' || goldPrice == '0' || totalPrice == '0' ){
                    // return response.status(400).json({ msg: 'لطفا مقادیر درست را وارد کنید' });
                    return next(new responseModel(req, res,'لطفا مقادیر درست را وارد کنید' ,'create Invoice', 400,'لطفا مقادیر درست را وارد کنید' ,null))
                }
                if(!isHave){
                    return next(new responseModel(req, res,'در حال حاضر امکان انجام این معامله وجود ندارد' ,'create Invoice', 400,'در حال حاضر امکان انجام این معامله وجود ندارد' ,null))
                }
                
                
    
    
                const user=await this.userRepository.findOne({where:{id:req.user.id},relations:["telegram"]})
                if(!user){
                    return next(new responseModel(req, res,"کاربر پیدا نشد",'create Invoice', 400,"کاربر پیدا نشد",null))
                }
                if(!user.telegram){
                    return next(new responseModel(req, res,"کاربر در ربات تلگرام پیدا نشد",'create Invoice', 400,"کاربر در ربات تلگرام پیدا نشد",null))
                }
                // const userBankAccount : BankAccount=await this.bankAccountRepository.findOne({where:{isActive:true,owner:{id:req.user.id}}})
                // if(!userBankAccount){
                //     return next(new responseModel(req, res,"حساب بانکی یافت نشد",'create Invoice', 400,"حساب بانکی یافت نشد",null))
                // }
    
                // console.log("user log Bank",userBankAccount);
                console.log('body>>>>>' , goldPrice, goldWeight, type, totalPrice )
                goldWeight = formatGoldWeight(goldWeight)
                const time= new Date().toLocaleString('fa-IR').split(',')[1]
                const date= new Date().toLocaleString('fa-IR').split(',')[0]
                if(goldWeight<min||goldWeight>max){
                    return next(new responseModel(req, res,'لطفا مقدار وزن طلا را تغییر دهید','create Invoice', 400,'لطفا مقدار وزن طلا را تغییر دهید' ,null))
                }
                console.log('start the transaction',goldWeight)
                const invoiceId= this.generateInvoice()
                let transaction = this.invoiceRepository.create({                                    // here is the making the transActions
                    goldPrice: parseFloat(goldPrice),
                    goldWeight: parseFloat(goldWeight),
                    totalPrice: Math.floor(+totalPrice),
                    seller: type === 1 ? null : user,
                    buyer: type === 1 ? user :null,
                    remainGoldWeight:parseFloat(goldWeight),
                    type,
                    invoiceId,
                    // bankAccount:userBankAccount,
                    time,
                    date,
                    product:prices,
    
                    admins:[],
                    description,
                    productName:prices.persianName
                });
    
                await queryRunner.manager.save(transaction)
                
                let message
                if(type==0){
                     message = `
                    <b>کاربر گرامی</b>
                    
                    درخواست حواله خرید شما <b>ثبت شد</b> و در حال بررسی می‌باشد:
                    
                    <b>مشخصات حواله:</b>
                    * <b>مقدار:</b> ${goldWeight} گرم  
                    * <b>مبلغ:</b> ${totalPrice.toLocaleString()} تومان  
                    * <b>شماره فاکتور:</b> ${invoiceId}  
                    * <b>تاریخ و ساعت:</b> ${date} ${time}
                    
                    با تشکر از صبر و شکیبایی شما.
                    `;
                }else{ 
                     message = `
    <b>کاربر گرامی</b>
    
    درخواست حواله خرید شما <b>ثبت شد</b> و در حال بررسی می‌باشد:
    
    <b>مشخصات حواله:</b>
    * <b>مقدار:</b> ${goldWeight} گرم  
    * <b>مبلغ:</b> ${totalPrice.toLocaleString()} تومان  
    * <b>شماره فاکتور:</b> ${invoiceId}  
    * <b>تاریخ و ساعت:</b> ${date} ${time}
    
    با تشکر از صبر و شکیبایی شما.
    `;
                }
    
                // showMainMenu(this.bot,user.telegram.chatId,message)
                this.sendMessageWithInline(message,user.telegram.chatId,transaction.id)
                await queryRunner.commitTransaction()
                return next(new responseModel(req, res,null,'create Invoice', 200,null,transaction))
            }else{
                const realGoldprice=(type==0)?+prices.sellPrice:+prices.buyPrice
                const isHave=(type==0)?prices.haveSell:prices.haveBuy
                
                const realTotalrice=realGoldprice*(+goldWeight)
                if(!isOpen){
                    return next(new responseModel(req, res,"معاملات تا اطلاع ثانوی بسته می باشد",'create Invoice', 400,"معاملات تا اطلاع ثانوی بسته می باشد",null))
                }
 

                if (realGoldprice - (+goldPrice) >= 10000){
                    console.log('condition1')
                    goldPrice = realGoldprice
                    // return response.status(400).json({ msg: 'امکان ثبت معامله در این قیمت وجود ندارد' });
                }
                if ((realTotalrice - (+totalPrice)) >= (10*(+goldWeight))){
                    console.log('condition2')
                    totalPrice = realTotalrice
                    // return response.status(400).json({ msg: 'امکان ثبت معامله در این قیمت وجود ندارد' });
                }   
                console.log('weight>>>' , (realTotalrice) , totalPrice)
                // console.log('total' , totalPrice , typeof(totalPrice))
                if (goldWeight == '0' || goldPrice == '0' || totalPrice == '0' ){
                    // return response.status(400).json({ msg: 'لطفا مقادیر درست را وارد کنید' });
                    return next(new responseModel(req, res,'لطفا مقادیر درست را وارد کنید' ,'create Invoice', 400,'لطفا مقادیر درست را وارد کنید' ,null))
                }
                if(!isHave){
                    return next(new responseModel(req, res,'در حال حاضر امکان انجام این معامله وجود ندارد' ,'create Invoice', 400,'در حال حاضر امکان انجام این معامله وجود ندارد' ,null))
                }
                
                
    
    
                const user=await this.userRepository.findOne({where:{id:req.user.id},relations:["telegram"]})
                if(!user){
                    return next(new responseModel(req, res,"کاربر پیدا نشد",'create Invoice', 400,"کاربر پیدا نشد",null))
                }
                if(!user.telegram){
                    return next(new responseModel(req, res,"کاربر در ربات تلگرام پیدا نشد",'create Invoice', 400,"کاربر در ربات تلگرام پیدا نشد",null))
                }
                // const userBankAccount : BankAccount=await this.bankAccountRepository.findOne({where:{isActive:true,owner:{id:req.user.id}}})
                // if(!userBankAccount){
                //     return next(new responseModel(req, res,"حساب بانکی یافت نشد",'create Invoice', 400,"حساب بانکی یافت نشد",null))
                // }
    
                // console.log("user log Bank",userBankAccount);
                console.log('body>>>>>' , goldPrice, goldWeight, type, totalPrice )
                const time= new Date().toLocaleString('fa-IR').split(',')[1]
                const date= new Date().toLocaleString('fa-IR').split(',')[0]
                if(goldWeight<minCoin||goldWeight>maxCoin){
                    return next(new responseModel(req, res,'لطفا مقدار وزن طلا را تغییر دهید','create Invoice', 400,'لطفا مقدار وزن طلا را تغییر دهید' ,null))
                }
                console.log('start the transaction',goldWeight)
                const invoiceId= this.generateInvoice()
                let transaction = this.invoiceRepository.create({                                    // here is the making the transActions
                    goldPrice: parseFloat(goldPrice),
                    coinCount: +goldWeight,
                    totalPrice: Math.floor(+totalPrice),
                    seller: type === 1 ? null : user,
                    buyer: type === 1 ? user :null,
                    remainGoldWeight:+goldWeight,
                    type,
                    invoiceId,
                    // bankAccount:userBankAccount,
                    time,
                    date,
                    product:prices,
    
                    admins:[],
                    description,
                    productName:prices.persianName
                });
    
                await queryRunner.manager.save(transaction)
               

                let message
                if(type==0){
                     message = `
                    <b>کاربر گرامی</b>
                    
                    درخواست حواله خرید شما <b>ثبت شد</b> و در حال بررسی می‌باشد:
                    
                    <b>مشخصات حواله:</b>
                    * <b>مقدار:</b> ${goldWeight} عدد  
                    * <b>تام سکه:</b> ${prices.persianName} 
                    * <b>مبلغ:</b> ${totalPrice.toLocaleString()} تومان  
                    * <b>شماره فاکتور:</b> ${invoiceId}  
                    * <b>تاریخ و ساعت:</b> ${date} ${time}
                    
                    با تشکر از صبر و شکیبایی شما.
                    `;
                }else{ 
                     message = `
    <b>کاربر گرامی</b>
    
    درخواست حواله خرید شما <b>ثبت شد</b> و در حال بررسی می‌باشد:
    
    * <b>مقدار:</b> ${goldWeight} عدد  
                    * <b>تام سکه:</b> ${prices.persianName} 
                    * <b>مبلغ:</b> ${totalPrice.toLocaleString()} تومان  
                    * <b>شماره فاکتور:</b> ${invoiceId}  
                    * <b>تاریخ و ساعت:</b> ${date} ${time}
    
    با تشکر از صبر و شکیبایی شما.
    `;
                }
    
                // showMainMenu(this.bot,user.telegram.chatId,message)
               
                this.sendMessageWithInline(message,user.telegram.chatId,transaction.id)


                await queryRunner.commitTransaction()
                return next(new responseModel(req, res,null,'create Invoice', 200,null,null))
            }

           
            
        }catch(err){
            await queryRunner.rollbackTransaction()
            console.log("error",err);
            return next(new responseModel(req, res,"خطای داخلی سیستم",'invoice', 500,"خطای داخلی سیستم",null))

        }finally{
            console.log('transaction released')
            await queryRunner.release()
        }
    }

    sendMessageWithInline(message : string ,chatId : any ,invoiceId:any){
        console.log(invoiceId);
        console.log(`user-yes:${invoiceId}`);
        
        this.bot.sendMessage(chatId, message, {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: 'تایید', callback_data: `user-yes:${invoiceId}` },
                  { text: 'لغو', callback_data: `user-cancel:${invoiceId}` }
                ]
              ]
            },
            parse_mode: "HTML"
          });
    }


    
    
       
}