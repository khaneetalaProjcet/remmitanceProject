import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn,ManyToOne } from "typeorm"
import { Invoice } from "./Invoice"
import { User } from "./User"


@Entity()
export class Delivery {
   
    @PrimaryGeneratedColumn()
    id : number
   
    @Column() //! 1 -> noraml    2->transfer
    type : string 
    
    @Column({ type: "numeric", precision: 10, scale: 3, default: 0 ,nullable:true})
    goldWeight : number

    @ManyToOne(()=> Invoice ,(invoice) => invoice.deliveries )
    invoice:Invoice

    @ManyToOne(()=> User , (user)=> user.deliveries , {nullable:true})
    mainUser : User

    @ManyToOne(()=> User , (user)=> user.transferdeliveries,{nullable:true})
    destUser : User

    @Column({nullable:true})
    coinCount: number

    @Column({nullable:true,default:"",type:"varchar"})
    description:string

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