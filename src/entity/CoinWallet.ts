import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn,ManyToOne } from "typeorm"
import { Invoice } from "./Invoice"
import { User } from "./User"
import { Admin } from "./Admin"
import { InvoiceStatus } from "./enums/InvoiceStatus"
import { Wallet } from "./Wallet"
import { Prices } from "./Prices"


@Entity()
export class CoinWallet
 {
   
    @PrimaryGeneratedColumn()
    id : number
   
    @Column() //! 1 -> user   2->admin
    count : number 
    
    @ManyToOne(()=> Wallet ,(wallet) => wallet.coins)
    wallet:Wallet

     
    @ManyToOne(()=> Prices ,(price) => price.coinWallet)
    product:Prices
    

    @CreateDateColumn()
    createdAt: Date
    
    @UpdateDateColumn()
    updatedAt : Date
            
    @DeleteDateColumn()
    deletedAt : Date

}