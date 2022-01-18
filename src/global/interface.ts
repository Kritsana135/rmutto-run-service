import { Request, Response } from "express";
import { Stream } from "stream";

export interface CustomContext {
  req: Request;
  res: Response;
  payload?: { userId: string };
}

export interface IKeyPairsError {
  key: string;
  message: string;
}

export interface Upload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => Stream;
}
