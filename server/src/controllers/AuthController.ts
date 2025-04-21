import { Request, Response, NextFunction } from "express";
import UserSchema from "../models/UserSchema";
import AdminSchema from "../models/AdminSchema";

export const STORE_SIGNUP_DATA = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("IN THE SIGN UP FUNCTION");
    console.log(request.body);

    // Check the role field to determine which schema to use
    const { role } = request.body;

    if (role === "admin") {
      const { fullName, email,  clerkUserId, role } = request.body;

      const newAdmin = new AdminSchema({
        fullName,
        email,
        role,
        clerkUserId, // storing the clerkUserId as provided
      });
      console.log("-----------------");
      console.log(newAdmin);
      console.log("-----------------");

      await newAdmin.save();
      response.status(200).json({ message: "Teacher sign up successful" });
    } else if (role === "user") {
      const { fullName, email, clerkUserId,  role, address, phoneNumber  } = request.body;

      const newUser = new UserSchema({
        fullName,
        email,
        role,
        address,
        phoneNumber,
        clerkUserId, // storing the clerkUserId as provided
      });
      console.log("-----------------");
      console.log(newUser);
      console.log("-----------------");

      await newUser.save();
      response.status(200).json({ message: "Student sign up successful" });
    } else {
      response.status(400).json({ message: "Invalid role provided" });
    }
  } catch (error) {
    next(error);
  }
};