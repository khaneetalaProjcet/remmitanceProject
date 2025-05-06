import { Entity, PrimaryGeneratedColumn, Column, OneToMany,OneToOne, UpdateDateColumn, DeleteDateColumn, CreateDateColumn  } from "typeorm"
import { VerificationStatus } from "./enums/VerificationStatus"
import { Invoice } from "./Invoice"
import { Wallet } from "./Wallet";
import { BankAccount } from "./BankAccount";
import { TelegramUser } from "./TelegramUser";
import { Delivery } from "./Delivery"
import { Actions } from "./Actions";



@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable:true,type:"varchar"})
    firstName: string

    @Column({nullable:true,type:"varchar"})
    lastName: string

    @Column({
        type: "enum",
        enum: VerificationStatus,
        default: VerificationStatus.INIT
    })    
    verificationStatus : VerificationStatus

    @Column({type:"varchar"})
    phoneNumber : string
    
    @OneToMany(() => Invoice , (invoice)=> invoice.seller, {nullable : true})
    sells : Invoice[]
    
    @OneToMany(() => Invoice , (invoice)=> invoice.buyer , {nullable : true})
    buys : Invoice[]

    @OneToMany(() => Delivery , (delivery)=> delivery.destUser , {nullable : true})
    transferdeliveries : Invoice[]

    @OneToMany(() => Delivery , (delivery)=> delivery.mainUser , {nullable : true})
    deliveries : Invoice[]

    @OneToMany(() => Actions , (action)=> action.user, {nullable : true})
    actions : Actions[]

    @OneToOne(() => Wallet, (wallet) => wallet.user, { cascade: true })
    wallet: Wallet;

    @OneToOne(() => TelegramUser, (telegram) => telegram.user, { cascade: true })
    telegram: TelegramUser;
    
    @OneToMany(() => BankAccount , (bankAccount)=> bankAccount.owner , {nullable : true,cascade: true})
    bankAccounts : BankAccount[]

    @Column({ default: false })
    isHaveBank : boolean
    
    @Column({ default: false })
    isSystemUser : boolean

    @Column({type:"varchar",nullable:true})
    date:string

    @Column({type:"varchar",nullable:true})
    time:string
    
    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt : Date
        
    @DeleteDateColumn()
    deletedAt : Date
    
}

