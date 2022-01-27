import { Field, ObjectType } from "type-graphql";
import { Column, Entity } from "typeorm";
import { BaseAppEntity } from "./BaseAppEntity";

@ObjectType()
@Entity("app")
export class App extends BaseAppEntity {
  @Field()
  @Column({ type: "float" })
  goalKm: number;

  @Field()
  @Column()
  startDate: Date;

  @Field()
  @Column()
  endDate: Date;

  @Field()
  @Column()
  eventName: Date;
}
