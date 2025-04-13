import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm"

@Entity()
export class PaymentInfo {

    
    @PrimaryGeneratedColumn()
    id: string
    
    @Column({ type: "numeric", precision: 10, scale: 0,default : 0 })
    amount: number

    @Column()
    authority : string

    @Column({nullable : true})
    invoiceId : number
    
    @Column()
    userId : number

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt : Date
        
    @DeleteDateColumn()
    deletedAt : Date
}