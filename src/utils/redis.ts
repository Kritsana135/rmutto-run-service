import Redis from "ioredis";
import { IPerformNewHashData } from "../modules/Progress/types/ProgressType";

export const redis = new Redis();

export const performNewHashData = async ({
  km,
  id,
  displayName,
}: IPerformNewHashData) => {
  await redis.hmset(id, ["name", displayName, "km", km]);
};
