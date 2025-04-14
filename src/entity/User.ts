import { Entity, PrimaryGeneratedColumn, Column, OneToMany,OneToOne, UpdateDateColumn, DeleteDateColumn, CreateDateColumn  } from "typeorm"
import { VerificationStatus } from "./enums/VerificationStatus"
import { Invoice } from "./Invoice"
import { Wallet } from "./Wallet";
import { BankAccount } from "./BankAccount";


@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable : true})
    birthDate: string

    @Column({nullable:true,type:"varchar"})
    firstName: string

    @Column({nullable:true})
    lastName: string

    @Column({nullable : true})
    age: number 

    @Column({nullable : true})
    fatherName : string

    @Column({nullable : true})
    email : string

    @Column({nullable : true})
    password : string

    @Column({nullable:true,type:"varchar"})
    refreshToken:string

    @Column({
        type: "enum",
        enum: VerificationStatus,
        default: VerificationStatus.PENDING
    })    
    verificationStatus : VerificationStatus

    @Column({nullable : true})
    gender : boolean

    @Column({nullable : true})
    identityNumber : string

    @Column({nullable : true})
    identitySerial : string

    @Column({nullable : true})
    identitySeri : string

    @Column({nullable : true})
    officeName : string
    
    @Column({nullable : true})
    liveStatus : boolean
   
    @Column()
    phoneNumber : string

    @Column({nullable : true})
    nationalCode : string
    
    @OneToMany(() => Invoice , (invoice)=> invoice.seller, {nullable : true})
    sells : Invoice[]
    
    @OneToMany(() => Invoice , (invoice)=> invoice.buyer , {nullable : true})
    buys : Invoice[]

    @OneToOne(() => Wallet, (wallet) => wallet.user, { cascade: true })
    wallet: Wallet;
    
    @OneToMany(() => BankAccount , (bankAccount)=> bankAccount.owner , {nullable : true,cascade: true})
    bankAccounts : BankAccount[]

    @Column({nullable : true , default : '' , type : 'varchar'})
    identityTraceCode : string;

    @Column({ default: false })
    isSystemUser : boolean

    @Column({ default: false })
    isHaveBank : boolean

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

