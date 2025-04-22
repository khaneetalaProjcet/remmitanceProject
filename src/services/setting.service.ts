import { AppDataSource } from "../data-source";
import { Setting } from "../entity/Setting";
import cacher from "./cacher";



export class settingService {
    private settingRepository=AppDataSource.getRepository(Setting)
    async getSetting(){
        try{
            let setting
            try{
                 setting=await cacher.getter('setting')
                 if(!setting){
                  const settings= await this.settingRepository.find()
                  setting=settings[0]
                 }
                }catch(err){
                    const settings= await this.settingRepository.find()
                    setting=settings[0]
                    await cacher.setter("setting",setting)
                }
                return setting
        }catch(err){
            console.log(err);
            
        }
    }
}