import { AppDataSource } from "../data-source";
import { Request, Response,NextFunction, query } from "express";
import {Invoice} from "../entity/Invoice"
import {goldPriceService} from "../services/goldPrice.service"
import { responseModel } from "../utills/response.model";
import { User } from "../entity/User";
import {formatGoldWeight} from "../utills/HelperFunctions"
import { validationResult } from "express-validator";
import {settingService} from "../services/setting.service"
import { BankAccount } from "../entity/BankAccount";
import {showMainMenu} from "../services/telegramBot/menu"
import TelegramBot from 'node-telegram-bot-api';
const token = process.env.TELEGRAM_BOT_TOKEN|| "7622536105:AAFR0NDFR27rLDF270uuL5Ww_K0XZi61FCw";


export class InvoiceController{

    private invoiceRepository=AppDataSource.getRepository(Invoice)
    private userRepository=AppDataSource.getRepository(User)
    private bankAccountRepository=AppDataSource.getRepository(BankAccount)
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
            // const max=(type==0)?setting.maxTradeSell:setting.maxTradeBuy
            // const min=(type==0)?setting.minTradeSell:setting.minTradeBuy
            

            // console.log(`min : ${min} max : ${max}` );
            


            const prices=await this.goldPriceService.getGoldPrice()
            const realGoldprice=(type==0)?prices.sellPrice:prices.buyPrice
            
            const realTotalrice=realGoldprice*(+goldWeight)
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
            // if(goldWeight<min||goldWeight>max){
            //     return next(new responseModel(req, res,'لطفا مقدار وزن طلا را تغییر دهید','create Invoice', 400,'لطفا مقدار وزن طلا را تغییر دهید' ,null))
            // }
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
        ],relations:["seller","buyer","bankAccount","appBankAccount"],order:{createdAt:"DESC"}})


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


   





    

    
       
}