import {Field, ObjectType} from "type-graphql";

type ResponseCode = 'OK' | 'FAIL'

@ObjectType()
export class BaseResponse {
    @Field()
    code: ResponseCode

    @Field()
    message: string
}