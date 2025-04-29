import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm"

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


    @Column({type : "varchar"})  //?0 meltGold -- 1 coin
    type: string


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
