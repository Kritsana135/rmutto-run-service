import { Field, InputType } from "type-graphql";
import { Column } from "typeorm";

@InputType()
export class AppInput {
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
  eventName: string;

  @Field()
  @Column()
  eventKey: string;
}
