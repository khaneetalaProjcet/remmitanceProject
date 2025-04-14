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


export class AdminController{
    private adminRepository=AppDataSource.getRepository(Admin)
    private accessPointRepository=AppDataSource.getRepository(accessPoint)
    private jwtService=new JwtGenerator()
    async registerAdmin(req: Request, res: Response, next: NextFunction){
        const {
            firstName,
            lastName,
            phoneNumber,
            password,
        } =req.body
        const hashPass=await bcrypt.hash(password, 10)
        let newAdmin = this.adminRepository.create({
            firstName,
            lastName,
            phoneNumber,
            password:hashPass
        })
        await this.adminRepository.save(newAdmin)
        return  next(new responseModel(req, res,"ادمین ایجاد شد",'admin', 200,"ادمین ایجاد شد",null))
    }

    async loginAdmin(req: Request, res: Response, next: NextFunction){
        console.log('body' , req.body)
        let admin = await this.adminRepository.findOne({
            where: {
                phoneNumber: req.body.phoneNumber
            },relations : ['accessPoints']
        })
        let newAccessPoints = ['Dashboard']
        for (let i of admin.accessPoints){
            newAccessPoints.push(i.englishName)
        }
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
        let accessPoints = await this.accessPointRepository.find({where : {
            Admin : admin
        }})
        console.log(accessPoints)
        let tokenData: jwtGeneratorInterfaceAdmin = {
            id: admin.id,
            firstName: admin.firstName,
            lastName: admin.lastName,
            isBlocked: admin.isBlocked,
            phoneNumber : admin.phoneNumber,
            role : admin.role
        }
        console.log('token>>' , tokenData)
        let token = await this.jwtService.tokenizeAdminToken(tokenData)
        let responseData = { ...admin,accessPoints : newAccessPoints, token: token}
        console.log('ttoken' , token)
        return next(new responseModel(req, res,null, 'login admin', 200, null, responseData))
    }
    
    async getAllInvoice(req: Request, res: Response, next: NextFunction){

    }
    async getSellInvoicesWithStatus(req: Request, res: Response, next: NextFunction){

    }
    async getBuyInvoicesWithStatus(req: Request, res: Response, next: NextFunction){
        
    }

    async getAllSellInvoice(req: Request, res: Response, next: NextFunction){

    }
    
    async getAllBuyInvoice(req: Request, res: Response, next: NextFunction){

    }
   
    async approveSellInvoice(){}

    async rejectSellInvoice(){}

    async approveBuyInvoice(){}

    async rejectBuyInvoice(){}



}