import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, UpdateDateColumn, DeleteDateColumn } from "typeorm"
import { User } from "./User"

@Entity()
export class BankAccount {

    @PrimaryGeneratedColumn()
    id: number
    
    @Column()
    cardNumber : string

    @Column({nullable : true})
    shebaNumber : string
    
    @Column({nullable : true})
    name : string

    @ManyToOne(()=> User , (user)=> user.bankAccounts , { onDelete: "CASCADE" })
    owner : User
    
    @Column({default : false})
    isVerified : boolean

   @CreateDateColumn()
    createdAt: Date
   
    @UpdateDateColumn()
    updatedAt : Date
           
    @DeleteDateColumn()
    deletedAt : Date



}


