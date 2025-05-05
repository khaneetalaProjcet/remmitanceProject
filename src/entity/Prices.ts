import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { Invoice } from "./Invoice";

@Entity()
export class Prices {

    @PrimaryGeneratedColumn()
    id : number;

    @Column({ type : 'varchar'})
    name:string
 
    @Column({ type : 'varchar'})
    persianName:string
    
 
    @Column({type : 'varchar',nullable:true})
    sellPrice: string

    @Column({type : 'varchar',nullable:true})
    buyPrice: string

    @Column({type : 'boolean',nullable:true,default:true})
    haveBuy: boolean

    @Column({type : 'boolean',nullable:true,default:true})
    haveSell: boolean
    
    @Column({type : "varchar"})  //?0 meltGold -- 1 coin
    type: string


     @OneToMany(() => Invoice , (invoice)=> invoice.product , {nullable : true})
     invoices : Invoice[]


    @Column({nullable : true , default : '' , type : 'varchar'})
    date: string

    @Column({nullable : true , default : '' , type : 'varchar'})
    time: string

    @Column({type : 'bigint' , nullable : true})
    createTime : number;

    @CreateDateColumn()
    createdAt : Date;

    @DeleteDateColumn()
    deletedAt : Date

}
