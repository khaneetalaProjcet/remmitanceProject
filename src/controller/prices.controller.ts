import { AppDataSource } from "../data-source";
import { Request, Response,NextFunction } from "express";
import { Prices } from "../entity/Prices";
import { responseModel } from "../utills/response.model";
import {settingService} from "../services/setting.service"
import { goldPriceService } from "../services/goldPrice.service";
import cacher from "../services/cacher"
import {Fee} from "../entity/Fee"
import { authMiddlewareAdmin } from "../middleware/auth";



export class PricesController{
    
    private pricesRepository = AppDataSource.getRepository(Prices);
   
    

    async setGoldPrice(req: Request, res: Response, next: NextFunction){
      const {id,sellPrice,buyPrice}=req.body




      const price=await this.pricesRepository.findOne({where:{id}})
      if(!price){
        return next(new responseModel(req, res,"قیمت پیدا نشد",'get prices',400,"قیمت پیدا نشد",null))
      }
      
      price.sellPrice=sellPrice,
      price.buyPrice=buyPrice

      await this.pricesRepository.save(price)

      return next(new responseModel(req, res,null,'get prices', 200,null,price))
    }
    async getPrices(req: Request, res: Response, next: NextFunction){
        let prices=await this.pricesRepository.find({order:{createdAt:"DESC"}})
        if(prices.length==0){
               prices= await this.initPrices()
        }
        return next(new responseModel(req, res,null,'get prices', 200,null,prices))
    }
    async updateHaveSellOrBuy(req: Request, res: Response, next: NextFunction){
        const {haveSell,haveBuy,id}=req.body
 
        const price=await this.pricesRepository.findOne({where:{id}})
        if(!price){
          return next(new responseModel(req, res,"قیمت پیدا نشد",'get prices',400,"قیمت پیدا نشد",null))
        }
        price.haveBuy=haveBuy
        price.haveSell=haveSell
       
        await this.pricesRepository.save(price)

        return next(new responseModel(req, res,null,'get prices', 200,null,price))

    }
    async initPrices(){
        const time= new Date().toLocaleString('fa-IR').split(',')[1]
        const date= new Date().toLocaleString('fa-IR').split(',')[0]
        const prices=[{
            name:'meltTowmarrow' ,
            persianName:'آبشده نقد فردا',
            sellPrice:'70000',
            buyPrice:'70000',
            type:'0',
            date,
            time
        },
        {
            name:'meltTowDayAhead' ,
            persianName:'آبشده نقد پس فردا',
            sellPrice:'70000',
            buyPrice:'70000',
            type:'0',
            date,
            time
        },
        {
            name:'coin complete 86' ,
            persianName:'سکه تمام 86',
            sellPrice:'70000',
            buyPrice:'70000',
            type:'1',
            date,
            time
        },
        {
            name:'coin half 86' ,
            persianName:'نیم سکه 86',
            sellPrice:'70000',
            buyPrice:'70000',
            type:'1',
            date,
            time
        },
        {
            name:'coin quarter 86' ,
            persianName:'ربع سکه 86',
            sellPrice:'70000',
            buyPrice:'70000',
            type:'1',
            date,
            time
        },
        {
            name:'coin  old' ,
            persianName:'سکه تاریخ پایین',
            sellPrice:'70000',
            buyPrice:'70000',
            type:'1',
            date,
            time
        },
        {
            name:'coin half old' ,
            persianName:'نیم تاریخ پایین',
            sellPrice:'70000',
            buyPrice:'70000',
            type:'1',
            date,
            time
        },
        {
            name:'coin quarter old' ,
            persianName:'ربع تاریخ پایین',
            sellPrice:'70000',
            buyPrice:'70000',
            type:'1',
            date,
            time
        },
       
    
        ]

        const initPrices=this.pricesRepository.create(prices)
        return  await this.pricesRepository.save(initPrices)

        

    }


}