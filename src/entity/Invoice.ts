import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { User } from "./User"
import { InvoiceType } from "./enums/InvoiceType"
import {TradeType} from "./enums/TradeType"
import {InvoiceStatus} from "./enums/InvoiceStatus"

@Entity()
export class Invoice {
    @PrimaryGeneratedColumn()
    id : number

    @ManyToOne(()=> User , (user)=> user.sells)
    seller : User
   
    @ManyToOne(()=> User , (user)=> user.buys)
    buyer : User
    
    @Column({ type: "numeric", precision: 10, scale: 0,default : 0 })
    goldPrice : number

    @Column({ type: "numeric", precision: 10, scale: 3, default: 0 })
    goldWeight : number

    @Column({ type: "numeric", precision: 10, scale: 0,default : 0 })
    totalPrice : number
    
    @Column({nullable : true})
    authority : string

    @Column({nullable : true})
    invoiceId : string

    @Column({
        type: "enum",
        enum: InvoiceStatus,
        default: InvoiceStatus.INIT
    })
    status : InvoiceStatus 

    @Column()
    date : string

    @Column()
    time : string

    @Column({
        type: "enum",
        enum: InvoiceType,    
    })
    type : InvoiceType
     
    @Column({nullable:true,default:""})
    adminId:string

    @Column({nullable:true,default:""})
    accounterId:string

    // @Column({nullable:true,default:null})
    // paymentMethod :  number           //0 : gateway   1 :transport   2 :inperson   3 : cash   4 : phisicalGold         

    @Column({  default: "", type: "varchar" })
    originCardPan: string

    @Column({  default: "", type: "varchar" })
    destCardPan: string

    @Column({nullable:true,default:"",type:"varchar"})
    description:string

    @Column({nullable:true,default:"",type:"varchar"})
    accounterDescription:string
    @Column({
          type: "enum",
          enum: TradeType,
          default: TradeType.ONLINE
    })
    tradeType:TradeType

    @CreateDateColumn()
    createdAt: Date
   
    @UpdateDateColumn()
    updatedAt : Date
           
    @DeleteDateColumn()
    deletedAt : Date
}