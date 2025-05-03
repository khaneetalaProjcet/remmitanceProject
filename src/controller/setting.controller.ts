import { AppDataSource } from "../data-source";
import { Request, Response,NextFunction } from "express";
import {goldPriceService} from "../services/goldPrice.service"
import { responseModel } from "../utills/response.model";
import { Setting } from "../entity/Setting";
import {formatGoldWeight} from "../utills/HelperFunctions"
import cacher from "../services/cacher";



export class SettingController{

    
    private settingRepository=AppDataSource.getRepository(Setting)
    

    async updateSetting(req: Request, res: Response, next: NextFunction){
        let {
          maxTrade,
          minTrade,
          expireTime,
          tradeIsOpen
         } = req.body;

         
         
        try{
            const settings=await this.settingRepository.find()
            if(settings.length==0){
                maxTrade=formatGoldWeight(maxTrade)
                minTrade=formatGoldWeight(minTrade)
             
              const newSetting=this.settingRepository.create({
                maxTrade,
                minTrade,
                expireTime,
                tradeIsOpen
              })
              await this.settingRepository.save(newSetting)
              await cacher.setter("setting",newSetting)
           
              return next(new responseModel(req, res,null,'setting', 200,null,newSetting))
            } 
            const setting=settings[0]
            setting.maxTrade=maxTrade?formatGoldWeight(maxTrade):setting.maxTrade
            setting.minTrade=minTrade?formatGoldWeight(minTrade):setting.minTrade
            setting.expireTime=expireTime?expireTime:setting.expireTime,
            setting.tradeIsOpen=tradeIsOpen?tradeIsOpen:setting.tradeIsOpen
            await this.settingRepository.save(setting)
            await cacher.setter("setting",setting)

            
            return next(new responseModel(req, res,null,'setting', 200,null,setting))
            
        }catch(err){
            console.log("error",err);
            return next(new responseModel(req, res,"خطای داخلی سیستم",'setting', 500,"خطای داخلی سیستم",null))
            
        }
       



    }
    async getSetting(req: Request, res: Response, next: NextFunction){
        try{
            let setting
            try{
                 setting=await cacher.getter('setting')
                 console.log("from cach",setting);
                 if(!setting){
                  const settings= await this.settingRepository.find()
                  setting=settings[0]
                  console.log("from data base");
                 }
                }catch(err){
                    const settings= await this.settingRepository.find()
                    setting=settings[0]
                    await cacher.setter("setting",setting)
                    console.log("in catch");
                }
                return next(new responseModel(req, res,null,' user invoice', 200,null,setting))
        }catch(err){
            return next(new responseModel(req, res,"خطای داخلی سیستم",'setting', 500,"خطای داخلی سیستم",null))
        }
      
    }

    


   

}