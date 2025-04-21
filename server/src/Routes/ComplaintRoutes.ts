import { Router } from "express";
import { upload } from "../configurations/multer_config";

import { CREATE_COMPLAINTS, GET_ALL_COMPLAINTS, GET_COMPLAINT_BY_ID, UPDATE_COMPLAINT_STATUS } from "../controllers/ComplaintsController";

const ComplaintRoutes = Router();

ComplaintRoutes.post("/create-complaint", upload.array("images", 5), CREATE_COMPLAINTS);
ComplaintRoutes.get('/get-complaints', GET_ALL_COMPLAINTS);
// Get complaint by ID
ComplaintRoutes.get("/:id", GET_COMPLAINT_BY_ID);

// Update complaint status
ComplaintRoutes.patch("/:id/status", UPDATE_COMPLAINT_STATUS);
export default ComplaintRoutes;