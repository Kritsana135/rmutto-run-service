import { imageMIMEType } from "../config/uploadConfig";
import { createWriteStream } from "fs";
import { Stream } from "stream";

export interface IHandleUpload {
  mimetype: string;
  userId: string;
  directory: string;
  extensionName?: string;
  createReadStream: () => Stream;
}
export const createUploadUrl = async ({
  createReadStream,
  directory,
  userId,
  mimetype,
  extensionName = "",
}: IHandleUpload): Promise<string | null> => {
  if (!imageMIMEType.includes(mimetype)) {
    return null;
  }
  const fileType = mimetype.split("/")[1];
  const fileName = `${userId || ""}-${extensionName}.${fileType}`;
  const storeLocation = `${directory}/${fileName}`;
  const isSuccess = new Promise(async (resolve, reject) =>
    createReadStream()
      .pipe(createWriteStream(storeLocation))
      .on("finish", () => resolve(true))
      .on("error", () => reject(false))
  );
  if (await isSuccess) {
    return fileName;
  } else {
    return null;
  }
};
