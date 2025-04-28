import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class GoldPrice {

    @PrimaryGeneratedColumn()
    id : number;

    @Column({type : 'varchar',nullable:true})
    Geram18: string

    @Column({type : 'varchar',nullable:true})
    sellPrice: string

    @Column({type : 'varchar',nullable:true})
    buyPrice: string

    
    @Column({nullable : true , default : '' , type : 'varchar'})
    Date: string

    @Column({nullable : true , default : '' , type : 'varchar'})
    Time: string

    @Column({type : 'bigint' , nullable : true})
    createTime : number;

    @CreateDateColumn()
    createdAt : Date;

    @DeleteDateColumn()
    deletedAt : Date

}
