import { Arg, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { getConnection } from "typeorm";
import { App } from "../../../entity/App";
import { isAdmin } from "../../middleware/auth/adminAuth";
import { AppInput } from "../types/appType";

@Resolver()
export class AppResolver {
  @Mutation(() => App)
  @UseMiddleware(isAdmin)
  async saveApp(@Arg("input") input: AppInput): Promise<App> {
    const findApp = await App.findOne({
      where: { eventKey: input.eventKey },
    });

    if (findApp) {
      const saved = await getConnection()
        .createQueryBuilder()
        .update(App)
        .set({ ...input })
        .where("eventKey = :e", { e: input.eventKey })
        .returning("*")
        .execute();
      return saved.raw[0];
    } else {
      const app = await App.insert({ ...input });
      return { ...app.raw[0], ...input };
    }
  }

  @Query(() => App)
  async app(@Arg("eventKey") eventKey: string): Promise<App> {
    const findApp = await App.findOne({
      where: { eventKey },
    });
    if (!findApp) {
      throw new Error("ไม่พบ ข้อมูล app");
    }

    return findApp;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAdmin)
  async deleteApp(@Arg("eventKey") eventKey: string): Promise<Boolean> {
    await getConnection()
      .createQueryBuilder()
      .update(App)
      .set({ deletedAt: new Date() })
      .softDelete()
      .where("eventKey = :e", { e: eventKey })
      .execute();
    return true;
  }
}
