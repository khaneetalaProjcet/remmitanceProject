import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { Invoice } from "./Invoice"

@Entity()
export class InvoiceType {
   
    @PrimaryGeneratedColumn()
    id : number
   
    @Column()
    title : string 
    
    @Column()
    persianTitle : string

    @OneToMany(()=> Invoice ,(invoice) => invoice.type)
    invoices : Invoice[]

    @CreateDateColumn()
        createdAt: Date
    
    @UpdateDateColumn()
    updatedAt : Date
            
    @DeleteDateColumn()
    deletedAt : Date

}