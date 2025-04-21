import { Router } from "express";
import { GET_ADMIN_CONTACTS } from "../controllers/ContactsController";

const ContactRoutes = Router();

ContactRoutes.get("/admin-contacts", GET_ADMIN_CONTACTS);

export default ContactRoutes;