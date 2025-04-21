import { Request, Response, NextFunction } from "express";
import AdminSchema from "../models/AdminSchema";

export const GET_ADMIN_CONTACTS = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("Fetching admin contacts...");
    // Fetch all admin contacts from the database
    const admins = await AdminSchema.find({});
    response.status(200).json({ contacts: admins });
  } catch (error) {
    next(error);
  }
};