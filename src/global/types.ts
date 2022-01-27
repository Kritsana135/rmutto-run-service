import { Max, Min } from "class-validator";
import { ClassType, Field, InputType, Int, ObjectType } from "type-graphql";

export default function BaseResponse<TPayload>(
  TPayloadClass: ClassType<TPayload>
) {
  // instead of `isAbstract`, we have to provide a unique type name used in schema
  @ObjectType(`${TPayloadClass.name}Response`)
  class BaseResponseClass {
    @Field()
    code: string;

    @Field()
    message: string;

    @Field(() => TPayloadClass, { nullable: true })
    payload?: TPayload;
  }
  return BaseResponseClass;
}

@ObjectType()
export class ResponseClass {
  @Field()
  code: string;

  @Field()
  message: string;
}

@InputType()
export class PaginationInput {
  @Field(() => Int)
  @Min(1)
  page: number;

  @Field(() => Int)
  @Max(500)
  perPage: number;
}

@ObjectType()
export class Pagination {
  @Field(() => Int)
  page: number;

  @Field(() => Int)
  perPage: number;

  @Field(() => Int)
  totalItems: number;
}

@ObjectType()
export class DataWithPagination {
  @Field()
  pagination: Pagination;
}
