import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm"

@Entity()
export class Fee {

    @PrimaryGeneratedColumn()
    id: string
    
    @Column({nullable : true})
    sell: number

    @Column({nullable : true})
    buy : number

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt : Date
        
    @DeleteDateColumn()
    deletedAt : Date
}