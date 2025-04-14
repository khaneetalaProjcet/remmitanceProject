import { AppDataSource } from "../data-source";
import { Request, Response,NextFunction, query } from "express";
import {Invoice} from "../entity/Invoice"
import {goldPriceService} from "../services/goldPrice.service"
import { responseModel } from "../utills/response.model";
import { User } from "../entity/User";
import {formatGoldWeight} from "../utills/HelperFunctions"



export class InvoiceController{

    private invoiceRepository=AppDataSource.getRepository(Invoice)
    private userRepository=AppDataSource.getRepository(User)
    private goldPriceService=new goldPriceService()

    async createInvoice(req: Request, res: Response, next: NextFunction){
        let { goldPrice, goldWeight, type, totalPrice } = req.body;
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()
        try{
            const prices=await this.goldPriceService.getGoldPrice()
            const realGoldprice=type==0?prices.sellPrice:prices.buyPrice
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


            const user=await this.userRepository.findOneBy({id:req.user.id})
            if(!user){
                return next(new responseModel(req, res,"کاربر پیدا نشد",'create Invoice', 403,"کاربر پیدا نشد",null))
            }


            console.log('body>>>>>' , goldPrice, goldWeight, type, totalPrice )
            goldWeight = formatGoldWeight(goldWeight)
            console.log('start the transaction',goldWeight)
            const transaction = this.invoiceRepository.create({                                    // here is the making the transActions
                goldPrice: parseFloat(goldPrice),
                goldWeight: parseFloat(goldWeight),
                totalPrice: Math.floor(+totalPrice),
                seller: type === 1 ? null : user,
                buyer: type === 1 ? user :null,
                type,
                time: new Date().toLocaleString('fa-IR').split(',')[1],
                date: new Date().toLocaleString('fa-IR').split(',')[0],
            });

            await queryRunner.manager.save(transaction)
            await queryRunner.commitTransaction()
            return next(new responseModel(req, res,null,'create Invoice', 200,null,transaction))
            
        }catch(err){
            await queryRunner.rollbackTransaction()
            console.log("error",err);
            

        }finally{
            console.log('transaction released')
            await queryRunner.release()
        }



    }
    async getAllInvoiceForUser(req: Request, res: Response, next: NextFunction){
        
        const all=await this.invoiceRepository.find({where:[
            {seller:{id:req.user.id}},
            {buyer:{id:req.user.id}}
        ],relations:["seller","buyer"],order:{createdAt:"DESC"}})


        return next(new responseModel(req, res,null,' user invoice', 200,null,all))

    }
    async getAllInvoiceForUserFilter(req: Request, res: Response, next: NextFunction){
       const {status , type} =req.body
       const queryBuilder = this.invoiceRepository.createQueryBuilder('invoice')
       .leftJoinAndSelect('invoice.buyer', 'buyer')
       .leftJoinAndSelect('invoice.buyer', 'seller')
       .where('buyer.id = :userId or seller.id = :userId', { userId:req.user.id});
       queryBuilder.andWhere('invoice.status = :status and invoice.type', { status,type })
    
       const invoices = await queryBuilder
       .orderBy('invoice.createdAt', 'DESC')
       .getMany();
        
       return next(new responseModel(req, res,null,' user invoice', 200,null,invoices))
    }
    
       
}