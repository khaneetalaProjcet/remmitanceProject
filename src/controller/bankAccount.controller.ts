import { AppDataSource } from "../data-source";
import { Request, Response,NextFunction } from "express";
import { User } from "../entity/User";
import {BankAccount} from "../entity/BankAccount" 
import { ShahkarService } from "../services/shahkar-service";
import { responseModel } from "../utills/response.model";
import { AppBankAccount } from "../entity/AppBankAccount";




export class bankAccountController {
    private userRepository=AppDataSource.getRepository(User)
    private bankAccountRepository=AppDataSource.getRepository(BankAccount)
    private appBankAccount=AppDataSource.getRepository(AppBankAccount)
    private shahkarSerice=new ShahkarService()
 

    async createBankAccount(req: Request, res: Response, next: NextFunction){
        const { cardNumber } = req.body;
        let ownerId = req.user.id
        if ( !cardNumber || !ownerId) {
            return next(new responseModel(req, res,"فیلد شماره کارت نمیتواند خالی باشد",'create bank account', 400,"فیلد شماره کارت نمیتواند خالی باشد",null))
            
        }

        try {
            const owner = await this.userRepository.findOne({where:{ id: ownerId },relations:["bankAccounts"]});
            const existBank=owner.bankAccounts.filter(item=>item.cardNumber==cardNumber)

            if (!owner) {
                return next(new responseModel(req, res,"کاربر پیدا نشد",'create bank account', 403,"کاربر پیدا نشد",null))
            }
            if(existBank.length>0){
                return next(new responseModel(req, res,"این حساب قبلا ثبت شده است",'create bank account', 403,"این حساب قبلا ثبت شده است",null))

            }

            console.log("1");
            

            const bankAccount = this.bankAccountRepository.create({
                cardNumber,
                owner,
                isVerified: false
            });
            let info = {cardNumber : bankAccount.cardNumber , 
                // nationalCode : owner.nationalCode , 
                // birthDate : owner.birthDate
             }
                // let isMatch = await  this.shahkarSerice.checkMatchPhoneNumberAndCartNumber(info)
                // bankAccount.isVerified = isMatch;
                console.log("2");

                // console.log("isss",isMatch);
                
                
                // if (isMatch) {
               
                //     let res =  await this.shahkarSerice.convertCardToSheba(cardNumber)
                //     if (res) {
                //         bankAccount.shebaNumber = res.ibanInfo.iban
                //         bankAccount.name = res.ibanInfo.bank
                //     }
                //     console.log(res)
                //     owner.isHaveBank = true;
                //     await this.userRepository.save(owner)
                //     const activeCartBank=await this.bankAccountRepository.findOne({where:{owner:{id:ownerId},isActive:true}})
                //     if(!activeCartBank){
                //         bankAccount.isActive=true
                //     }
                //     const createBankAccount = await this.bankAccountRepository.save(bankAccount);
                //     console.log("3");
                    
                //     // await this.smsService.sendGeneralMessage(owner.phoneNumber,"verifyCart" , bankAccount.cardNumber,null,null)

                //     return next(new responseModel(req, res,null,'create bank account', 200,null,createBankAccount))             
                    
                // }
                 
                if (1==1) {
               
                    let respone =  await this.shahkarSerice.convertCardToSheba(cardNumber)
                    console.log(res);
                    
                    if (res) {
                        bankAccount.shebaNumber = respone.ibanInfo.iban
                        bankAccount.name = respone.ibanInfo.bank

                        console.log("res",respone);
                        
                    }
                    console.log(respone)
                    owner.isHaveBank = true;
                    await this.userRepository.save(owner)
                    const activeCartBank=await this.bankAccountRepository.findOne({where:{owner:{id:ownerId},isActive:true}})
                    if(!activeCartBank){
                        bankAccount.isActive=true
                    }
                    const createBankAccount = await this.bankAccountRepository.save(bankAccount);
                    console.log("3");
                    
                    // await this.smsService.sendGeneralMessage(owner.phoneNumber,"verifyCart" , bankAccount.cardNumber,null,null)    
                    return  next(new responseModel(req, res,null,'create bank',200,null,createBankAccount))  
                         
                    
                }
                console.log("4");
                
               
                return next(new responseModel(req, res,"کارت نامعتبر است",'create bank account', 400,"کارت نامعتبر است",null))
            
            } catch (error) {
                console.log("Error in creating bank account", error);
                return next(new responseModel(req, res, "خطا در ثبت کارت بانکی",'create bank account', 500, "خطا در ثبت کارت بانکی",null))
            }
    }
    async createAppBankAccount(req: Request, res: Response, next: NextFunction){
        const {cardNumber,shebaNumber,name,ownerName,type}=req.body
        try{
            const newAppBankAccount=this.appBankAccount.create({cardNumber,shebaNumber,name,ownerName,type})
            await this.appBankAccount.save(newAppBankAccount)
            return next(new responseModel(req, res,null,'create bank account', 200,null,newAppBankAccount))

        }catch(err){
            return next(new responseModel(req, res, "خطا در ثبت کارت بانکی",'create Invoice', 500, "خطا در ثبت کارت بانکی",null))
        }
       
    }
    async deleteAppBankAccount(req: Request, res: Response, next: NextFunction){
        const id=+req.params.id
        const deleteBankAccount=await this.appBankAccount.findOne({where:{id}})
        deleteBankAccount.isDelete=true
        await this.appBankAccount.save(deleteBankAccount)
        return  next(new responseModel(req, res,null,'create bank',200,null,deleteBankAccount))  

    }
    async activeBankAccount(req: Request, res: Response, next: NextFunction){
        const userId=req.user.id
        const newActiveBankAccountId=req.params.id
        const activeCartBank=await this.bankAccountRepository.findOne({where:{owner:{id:userId},isActive:true}})
        const newActiveCartBank=await this.bankAccountRepository.findOne({where:{owner:{id:userId},id:+newActiveBankAccountId}})
        if(activeCartBank){
            activeCartBank.isActive=false
            await this.bankAccountRepository.save(activeCartBank)
        }
 
        newActiveCartBank.isActive=true
        await this.bankAccountRepository.save(newActiveCartBank)
        return next(new responseModel(req, res,null,'active bank account', 200,null,newActiveBankAccountId))


    }
    async deleteBankAccount(req: Request, res: Response, next: NextFunction){
        const bankAccountId=+req.params.id
        const bankaccount=await this.bankAccountRepository.findOne({where:{owner:{id:req.user.id},id:bankAccountId}})
        if(!bankaccount){
            return next(new responseModel(req, res,"کارت نامعتبر است",'create bank account', 400,"کارت نامعتبر است",null))
        }
        if(bankaccount.isActive){
            return next(new responseModel(req, res,"حذف کارت فعال ممکن نمی باشد",'create bank account', 400,"حذف کارت فعال ممکن نمی باشد",null))
        }
        await this.bankAccountRepository.remove(bankaccount)
        return  next(new responseModel(req, res,null,'delete bank',200,null,null))  
    }

    async getAllBankAccount(req: Request, res: Response, next: NextFunction){
        const all=await this.appBankAccount.find({where:{type:1,isDelete:false}})
        return  next(new responseModel(req, res,"all app Bank",'profile', 200,"all app Bank",all))
    }




}