import { AppDataSource } from "../data-source";
import { Request, Response,NextFunction, query } from "express";
import {Invoice} from "../entity/Invoice"
import {goldPriceService} from "../services/goldPrice.service"
import { responseModel } from "../utills/response.model";
import { User } from "../entity/User";
import {formatGoldWeight} from "../utills/HelperFunctions"
import { validationResult } from "express-validator";
import {settingService} from "../services/setting.service"
import { OfferInvoice } from "../entity/OfferInvoice";
import { Setting } from "../entity/Setting";



export class OfferInvoiceController{

    private offerInvoiceRepository=AppDataSource.getRepository(OfferInvoice)
    private userRepository=AppDataSource.getRepository(User)
    private goldPriceService=new goldPriceService()
    private settingService=new settingService()
    

    private  generateInvoice(){
        return (new Date().getTime()).toString()
    }

    async createOfferInvoice(req: Request, res: Response, next: NextFunction){
        let { goldPrice, goldWeight, type, totalPrice , fee } = req.body;
        const bodyError = validationResult(req)
        if (!bodyError.isEmpty()) {
          return next(new responseModel(req, res,bodyError['errors'][0].msg,'invoice',400,bodyError['errors'][0].msg ,null))
        }   
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()
        try{
            const setting : Setting =await this.settingService.getSetting()
            const max=(type==0)?setting.maxTradeSell:setting.maxTradeBuy  //?saghf moamelat
            const min=(type==0)?setting.minTradeSell:setting.minTradeBuy  //?kaf moamelat 
            const tolerance=setting.offerTolerance

            


            console.log(`min : ${min} max : ${max}` );
            


            const prices=await this.goldPriceService.getGoldPrice()
            const realGoldPrice=(type==0)?prices.sellPrice:prices.buyPrice
            
            const maxTolerance=realGoldPrice+tolerance
            const minTolerance=realGoldPrice+tolerance

            if(goldPrice<minTolerance||goldPrice>maxTolerance){  //? shart mohasebe 
               
                return next(new responseModel(req, res, `فاصله قیمت پیشنهادی با قیمت اصلی نمی تواند بیشتر از  ${tolerance} تومان باشد`,'create Invoice', 400, `فاصله قیمت پیشنهادی با قیمت اصلی نمی تواند بیشتر از  ${tolerance} تومان باشد` ,null))
            }
            
            
            if (goldWeight == '0' || goldPrice == '0' || totalPrice == '0' ){
                // return response.status(400).json({ msg: 'لطفا مقادیر درست را وارد کنید' });
                return next(new responseModel(req, res,'لطفا مقادیر درست را وارد کنید' ,'create Invoice', 400,'لطفا مقادیر درست را وارد کنید' ,null))
            }
            


            const user=await this.userRepository.findOneBy({id:req.user.id})
            if(!user){
                return next(new responseModel(req, res,"کاربر پیدا نشد",'create Invoice', 403,"کاربر پیدا نشد",null))
            }


            console.log('body>>>>>' , goldPrice, goldWeight, type, totalPrice )
            goldWeight = formatGoldWeight(goldWeight)
            
            if(goldWeight<min||goldWeight>max){
                return next(new responseModel(req, res,'لطفا مقدار وزن طلا را تغییر دهید','create Invoice', 400,'لطفا مقدار وزن طلا را تغییر دهید' ,null))
            }
            console.log('start the transaction',goldWeight)
            const invoiceId= this.generateInvoice()
            const transaction = this.offerInvoiceRepository.create({                                    // here is the making the transActions
                goldPrice: parseFloat(goldPrice),
                goldWeight: parseFloat(goldWeight),
                totalPrice: Math.floor(+totalPrice),
                seller: type === 1 ? null : user,
                buyer: type === 1 ? user :null,
                type,
                fee,
                invoiceId,
                realGoldPrice:realGoldPrice,
                time: new Date().toLocaleString('fa-IR').split(',')[1],
                date: new Date().toLocaleString('fa-IR').split(',')[0],
            });

            await queryRunner.manager.save(transaction)
            await queryRunner.commitTransaction()
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
    async getAllOfferInvoiceForUser(req: Request, res: Response, next: NextFunction){
        
        const all=await this.offerInvoiceRepository.find({where:[
            {seller:{id:req.user.id}},
            {buyer:{id:req.user.id}}
        ],relations:["seller","buyer"],order:{createdAt:"DESC"}})


        return next(new responseModel(req, res,null,' user invoice', 200,null,all))

    }

    async getOneOfferInvoice(req: Request, res: Response, next: NextFunction){
        const id=+req.params.id
        try{
            const invoice=await this.offerInvoiceRepository.findOne({where:{
                id:id
            },relations:["seller","buyer"]})
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
       const queryBuilder = this.offerInvoiceRepository.createQueryBuilder('invoice')
       .leftJoinAndSelect('invoice.buyer', 'buyer')
       .leftJoinAndSelect('invoice.buyer', 'seller')
       .where('buyer.id = :userId or seller.id = :userId', { userId:req.user.id});

       if(type&&status){
           queryBuilder.andWhere('invoice.status = :status and invoice.type = :type', { status,type })
       }
       if(status&&!type){
           queryBuilder.andWhere('invoice.status = :status ', { status })
       }
       if(!status&&type){
        queryBuilder.andWhere('invoice.type = : type', { type })
       }

    
       const invoices = await queryBuilder
       .orderBy('invoice.createdAt', 'DESC')
       .getMany();
        
       return next(new responseModel(req, res,null,' user invoice', 200,null,invoices))
    }


}