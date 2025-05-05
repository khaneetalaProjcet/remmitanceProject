import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { User } from "./User"
import { InvoiceType } from "./enums/InvoiceType"
import {TradeType} from "./enums/TradeType"
import {InvoiceStatus} from "./enums/InvoiceStatus"
import { Admin } from "./Admin"
import { BankAccount } from "./BankAccount"
import { AppBankAccount } from "./AppBankAccount"
import { Delivery } from "./Delivery"
import { Prices } from "./Prices"


@Entity()
export class Invoice {
    @PrimaryGeneratedColumn()
    id : number

    @ManyToOne(()=> User , (user)=> user.sells)
    seller : User
   
    @ManyToOne(()=> User , (user)=> user.buys)
    buyer : User

    @ManyToOne(()=> Prices , (price)=> price.invoices,{nullable:true})
    product : Prices
    
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
        default: InvoiceStatus.PENDING
    })
    status : InvoiceStatus 

    @OneToMany(()=> Delivery ,(delivery) => delivery.invoice)
    deliveries : Delivery[]

    @Column({nullable:true})
    coinCount: number

    @Column()
    date : string

    @Column()
    time : string

    @Column({
        type: "enum",
        enum: InvoiceType,    
    })
    type : InvoiceType
     
    @ManyToMany(() => Admin  )
    @JoinTable()
    admins:Admin[]

    

    @ManyToOne(() => BankAccount)
    bankAccount: BankAccount;

    @ManyToOne(() => AppBankAccount)
    appBankAccount: AppBankAccount;

    @Column({nullable:true,type:"varchar"})
    productName:string

    @Column({nullable:true,default:"",type:"varchar"})
    description:string

    @Column({nullable:true,default:"",type:"varchar"})
    adminDescription:string

    @Column({nullable:true,default:"",type:"varchar"})
    accounterDescription:string
    @Column({
          type: "enum",
          enum: TradeType,
          default: TradeType.ONLINE
    })
    tradeType:TradeType

    @Column({nullable:true})
    fee:Number

    @CreateDateColumn()
    createdAt: Date
   
    @UpdateDateColumn()
    updatedAt : Date
           
    @DeleteDateColumn()
    deletedAt : Date
}