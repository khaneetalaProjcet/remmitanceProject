import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToMany, JoinTable, OneToMany } from "typeorm"
import {Invoice} from "../entity/Invoice"
import { OfferInvoice } from "./OfferInvoice"



@Entity()
export class AppBankAccount {

    @PrimaryGeneratedColumn()
    id: number
    
    @Column()
    cardNumber : string

    @Column({type:"numeric",nullable:true,default:1})
    type : number

    @Column({nullable : true})
    shebaNumber : string
    
    @Column({nullable : true})
    name : string
    
    @Column({nullable:true})
    ownerName:string

    
    @OneToMany(() => Invoice,(invoice)=>invoice.appBankAccount, { onDelete: "CASCADE" })
    invoices: Invoice[];
    
    @OneToMany(()=>OfferInvoice,(invoice)=>invoice.appBankAccount, { onDelete: "CASCADE" })
    offerInvoices: OfferInvoice[];
    

    @CreateDateColumn()
    createdAt: Date
   
    @UpdateDateColumn()
    updatedAt : Date
           
    @DeleteDateColumn()
    deletedAt : Date



}


