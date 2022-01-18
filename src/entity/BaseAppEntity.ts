import {
  BaseEntity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class BaseAppEntity extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: null })
  deletedAt: Date;
}
