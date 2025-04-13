import { responseInterface } from "../interface/interfaces.interface"


export class response{
    constructor(req : any , res : any , scope : string , statusCode : number , error : string | {} | null , data : string | {} | null ) {
        const payload : responseInterface  = {
            success : (statusCode === 200) ? true : false,
            scope : scope,
            error : error,
            data : data , 
        }
        return res.status(statusCode).json(payload)
    }
} 