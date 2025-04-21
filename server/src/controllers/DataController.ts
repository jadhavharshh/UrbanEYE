import { Request, Response, NextFunction } from "express";

import 'express';

import AdminSchema from "../models/AdminSchema";
import UserSchema from "../models/UserSchema";

declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;
    }
  }
}

export const FETCH_USER_INFO = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  try {
    console.log("IN THE FETCH_USER_INFO CONTROLLER");
    const { userId } = request.query;
    const trimmedUserId = (userId as string)?.trim();

    if (!trimmedUserId) {
      response.status(400).json({ error: "Missing or invalid userId" });
      return;
    }

    // Check admin collection using clerkUserId
    const admin = await AdminSchema.findOne({ clerkUserId: trimmedUserId });
    if (admin) {
      response.status(200).json({ role: admin.role, data: admin });
      return;
    }

    // Check citizen collection using email from UserSchema
    const user = await UserSchema.findOne({ email: trimmedUserId });
    if (user) {
      response.status(200).json({ role: "citizen", data: user });
      return;
    }

    // Not found in any collection
    response.status(404).json({ error: "User not found in the database" });
  } catch (error) {
    next(error);
  }
};