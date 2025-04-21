import { Request, Response, NextFunction } from "express";
import path from "path";
import Complaint from "../models/ComplaintSchema";

// Extend the Express Request type to include files from Multer
interface MulterRequest extends Request {
  files: Express.Multer.File[];
}

export const CREATE_COMPLAINTS = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("IN THE COMPLAINTS CREATION FUNCTION");
    console.log("Request Body:", request.body);
    
    // Get the uploaded files from Multer
    const files = (request as MulterRequest).files;
    console.log("Uploaded Files:", files);
    
    // Extract file paths for storage in database
    const imagePaths = files ? files.map(file => {
      // Get relative path for storage in database
      return `/uploads/complaints/${path.basename(file.path)}`;
    }) : [];
    
    // Extract data from request body
    const { 
      type, 
      location, 
      description, 
      urgencyLevel,
      isAnonymous,
      name,
      email,
      phone,
      expectedResolution,
      userId  // Add userId to the extraction
    } = request.body;

    // Create a new complaint document
    const newComplaint = new Complaint({
      type,
      location,
      description,
      urgencyLevel,
      isAnonymous: isAnonymous === 'true', // Convert string to boolean
      name: isAnonymous === 'true' ? undefined : name,
      email: isAnonymous === 'true' ? undefined : email,
      phone: isAnonymous === 'true' ? undefined : phone,
      expectedResolution: expectedResolution || "3-5 days",
      images: imagePaths,
      userId: userId || undefined  // Add userId to the complaint document
    });

    // Save the complaint to the database
    const savedComplaint = await newComplaint.save();
    
    response.status(201).json({
      success: true,
      message: "Complaint created successfully",
      data: savedComplaint
    });
  } catch (error: any) {
    console.error("Error creating complaint:", error);
    response.status(500).json({
      success: false,
      message: "Error creating complaint",
      error: error.message
    });
  }
};

// Get all complaints
export const GET_ALL_COMPLAINTS = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    
    response.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints
    });
  } catch (error: any) {
    response.status(500).json({
      success: false,
      message: "Error retrieving complaints",
      error: error.message
    });
  }
};

// Get complaint by ID
export const GET_COMPLAINT_BY_ID = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const complaint = await Complaint.findById(request.params.id);
    
    if (!complaint) {
      response.status(404).json({
        success: false,
        message: "Complaint not found"
      });
      return;
    }
    
    response.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error: any) {
    response.status(500).json({
      success: false,
      message: "Error retrieving complaint",
      error: error.message
    });
  }
};

// Update complaint status
export const UPDATE_COMPLAINT_STATUS = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = request.body;
    
    const complaint = await Complaint.findByIdAndUpdate(
      request.params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!complaint) {
      response.status(404).json({
        success: false,
        message: "Complaint not found"
      });
      return;
    }
    
    response.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error: any) {
    response.status(500).json({
      success: false,
      message: "Error updating complaint status",
      error: error.message
    });
  }
};