import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn,ManyToOne } from "typeorm"
import { Invoice } from "./Invoice"
import { User } from "./User"
import { Admin } from "./Admin"
import { InvoiceStatus } from "./enums/InvoiceStatus"


@Entity()
export class Actions {
   
    @PrimaryGeneratedColumn()
    id : number
   
    @Column() //! 1 -> user   2->admin
    type : number 
    

    @ManyToOne(()=> Invoice ,(invoice) => invoice.actions )
    invoice:Invoice

    @ManyToOne(()=> User , (user)=> user.actions , {nullable:true})
    user : User


    @ManyToOne(()=> Admin , (admin)=> admin.actions , {nullable:true})
    admin : Admin


    @Column({ type: 'int'})
    fromStatus: InvoiceStatus;
  
    @Column({ type: 'int' })
    toStatus: InvoiceStatus;


    @Column()
    date : string

    @Column()
    time : string
   

    @CreateDateColumn()
    createdAt: Date
    
    @UpdateDateColumn()
    updatedAt : Date
            
    @DeleteDateColumn()
    deletedAt : Date

}