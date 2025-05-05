import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, UpdateDateColumn, DeleteDateColumn, ManyToMany, JoinTable, OneToMany } from "typeorm"
import { User } from "./User"
import { Invoice } from "./Invoice"
import { OfferInvoice } from "./OfferInvoice"

@Entity()
export class BankAccount {

    @PrimaryGeneratedColumn()
    id: number
    
    @Column({nullable:true})
    cardNumber : string

    @Column({nullable : true})
    shebaNumber : string
    
    @Column({nullable : true})
    name : string

    @Column({nullable : true})
    ownerName : string

    @ManyToOne(()=> User , (user)=> user.bankAccounts , { onDelete: "CASCADE" })
    owner : User
    
    @Column({default : false})
    isVerified : boolean

    @OneToMany(() => Invoice,(invoice)=>invoice.bankAccount, { onDelete: "CASCADE" })
    invoices: Invoice[];

    @OneToMany(()=>OfferInvoice,(invoice)=>invoice.bankAccount, { onDelete: "CASCADE" })
    offerInvoices: OfferInvoice[];

    @Column({default :false})
    isActive : boolean

    @CreateDateColumn()
    createdAt: Date
   
    @UpdateDateColumn()
    updatedAt : Date
           
    @DeleteDateColumn()
    deletedAt : Date



}


