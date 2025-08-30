const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middleware/authenticateUser");
const {
  getPendingAdminApprovals,
  approveAdmin,
  getAllAdmins,
  deactivateAdmin,
} = require("../controllers/adminController");

// All routes require super admin authentication
router.use(authenticateUser({ checkAccountStatus: true }));

// Get pending admin approvals
router.get("/pending-approvals", getPendingAdminApprovals);

// Get all admin users
router.get("/admins", getAllAdmins);

// Approve/reject admin user
router.patch("/admins/:adminId/approve", approveAdmin);

// Deactivate admin user
router.patch("/admins/:adminId/deactivate", deactivateAdmin);

module.exports = router;
