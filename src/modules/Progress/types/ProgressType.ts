import { Field, Int, ObjectType } from "type-graphql";
import { DataWithPagination } from "../../../global/types";

@ObjectType()
export class LeaderBoard {
  @Field()
  displayName: string;

  @Field()
  km: string;

  @Field()
  id: string;

  @Field(() => Int)
  no: number;
}

@ObjectType()
export class LeaderBoardRes extends DataWithPagination {
  @Field(() => [LeaderBoard])
  payload: Array<LeaderBoard | undefined>;
}

export interface IPerformNewHashData {
  displayName: string;
  id: string;
  km: string;
}

@ObjectType()
export class MyProgressRes {
  @Field()
  km: number;

  @Field(() => Int)
  no: number;
}
