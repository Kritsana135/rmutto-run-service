import {BaseEntity, Column, CreateDateColumn, UpdateDateColumn} from "typeorm";
import {ObjectType} from "type-graphql";

@ObjectType()
export class BaseAppEntity extends BaseEntity{

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column({ default: null })
    deleted_at: Date ;

}
