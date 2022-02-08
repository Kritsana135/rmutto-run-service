import { Progress } from "../../../entity/Progress";
import {
  Field,
  Float,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from "type-graphql";
import { DataWithPagination, PaginationInput } from "../../../global/types";
import { User } from "../../../entity/User";

@ObjectType()
export class LeaderBoard {
  @Field()
  displayName: string;

  @Field(() => Float)
  km: number;

  @Field()
  id: string;

  @Field(() => Int)
  no: number;

  @Field()
  bio: string;
}

@ObjectType()
export class ProgressTransaction extends Progress {
  @Field(() => User)
  user: User;
}

@ObjectType()
export class LeaderBoardRes extends DataWithPagination {
  @Field(() => [LeaderBoard])
  payload: Array<LeaderBoard | undefined>;
}

@ObjectType()
export class ProgressTransactionRes extends DataWithPagination {
  @Field(() => [ProgressTransaction])
  payload: Array<ProgressTransaction | undefined>;
}

export interface IPerformNewHashData {
  displayName: string;
  id: string;
  km: string;
  bio: string;
}

@ObjectType()
export class MyProgressRes {
  @Field()
  km: number;

  @Field(() => Int)
  no: number;
}

export enum ProgressTxTStatus {
  PENDING = "PENDING",
  APPROVE = "APPROVE",
  REJECT = "REJECT",
  ALL = "ALL",
}
registerEnumType(ProgressTxTStatus, {
  name: "ProgressTxTStatus", // this one is mandatory
});

@InputType()
export class ProgressTransactionInput extends PaginationInput {
  @Field()
  displayName: string;

  @Field(() => ProgressTxTStatus)
  status: ProgressTxTStatus;
}

@InputType()
export class ApproveTransactionInput {
  @Field()
  id: string;

  @Field()
  isApprove: boolean;

  @Field({ nullable: true })
  rejectReason: string;
}
