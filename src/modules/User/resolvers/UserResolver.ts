import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';
import { User } from '../../../entity/User';
import { CustomContext } from '../../../global/interface';
import { isAuth } from '../../middleware/authMiddleware';
import { GraphQLUpload } from 'graphql-upload';
import { Upload } from '../types/UserType';
import { v4 } from 'uuid';
import { createWriteStream } from 'fs';

@Resolver()
export class UserResolver {
    @Query(() => User , {nullable:true})
    @UseMiddleware(isAuth)
    async me (@Ctx() {payload}: CustomContext):Promise<User | undefined> {
        return await User.findOne({id: payload?.userId})
    }

    @Mutation(() => Boolean)
    async addProfilePicture(@Arg("picture", () => GraphQLUpload)
    {
      createReadStream,
      filename
    }: Upload): Promise<boolean> {
      const token = v4();
      console.log(token,createReadStream,filename)
      // return true
      return new Promise(async (resolve, reject) =>
            createReadStream()
                .pipe(createWriteStream(__dirname + `/../../../../images/profile/${filename}`))
                .on("finish", () => resolve(true))
                .on("error", (err) => {
                  console.log(err)
                  reject(false);
                })
        );
    }

}