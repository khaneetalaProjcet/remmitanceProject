import { AppDataSource } from "../data-source";
import { Request, Response,NextFunction } from "express";
import { User } from "../entity/User";
import { responseModel } from "../utills/response.model";
import {OtpService} from "../services/otp.service"
import {JwtGenerator} from "../services/jwt.service"
import { validationResult } from "express-validator";




export class AuthController {
    private userRepository = AppDataSource.getRepository(User);
    private otpService=new OtpService()
    private jwtGenerator=new JwtGenerator()

    /**
     * send otp to app
     * @param req 
     * @param res 
     * @param next 
     * @returns 
     */
   
    async sendOtpMessage(req: Request, res: Response, next: NextFunction) {
        try{
            const bodyError = validationResult(req)
            if (!bodyError.isEmpty()) {
                return next(new responseModel(req, res,bodyError['errors'][0].msg,'send otp',400,bodyError['errors'][0].msg ,null))
            }   
            const {phone}=req.body
            console.log(phone);
            const result=await this.otpService.sendOtpMessage(phone)
    
            if(result.status=="nok"){
                return next(new responseModel(req, res,result.msg,'send otp',400,result.msg ,null))
            }

            return next(new responseModel(req, res, '','send otp', 200, null,result.otp))
        }catch(err){
            return next(new responseModel(req, res,"خطای داخلی سیستم",'send otp', 500,"خطای داخلی سیستم",null))
        }
    }
    /**
     * login app user 
     * @param req 
     * @param res 
     * @param next 
     * @returns 
     */
    async loginUser (req: Request, res: Response, next: NextFunction){
        const bodyError = validationResult(req)
        if (!bodyError.isEmpty()) {
            return next(new responseModel(req, res,bodyError['errors'][0].msg,'login',400,bodyError['errors'][0].msg ,null))
        }   
        const {phone,otp}=req.body
        try{

         const result=await this.otpService.checkOtpVerification(phone,otp)
         console.log("resulttttt",result);
         
        if(result.status=="nok"){
            return next(new responseModel(req, res,result.msg,'login',400,result.msg ,null))
        }

        const user=await this.userRepository.findOne({where:{phoneNumber:phone}})

        if(!user){  //? user dont exist
            
        const newUser=this.userRepository.create({phoneNumber:phone})
        await this.userRepository.save(newUser) 
        const token=await this.jwtGenerator.tokenizeUserToken({id:user.id,phoneNumber:user.phoneNumber,isBlocked:false})
        return next(new responseModel(req, res,'','login',200,'',token))

        }else{ //? user exist 
            console.log(user);
            
            const token=await this.jwtGenerator.tokenizeUserToken({id:user.id,phoneNumber:user.phoneNumber,isBlocked:false})
            return next(new responseModel(req, res,'','login',200,'',token))
        }
        }catch(err){
            return next(new responseModel(req, res,"خطای داخلی سیستم",'send otp', 500,"خطای داخلی سیستم",null))
        }
    }


    


    



}   