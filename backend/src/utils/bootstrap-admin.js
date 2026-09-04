const bcrypt = require("bcryptjs");
const User = require("../models/userSchema");

async function bootstrapAdmin() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_RESET_PASSWORD_ON_BOOT } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.warn("Admin bootstrap skipped: ADMIN_EMAIL or ADMIN_PASSWORD is not configured.");
    return;
  }

  const normalizedEmail = ADMIN_EMAIL.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const admin = await User.findOne({ email: normalizedEmail });

  if (!admin) {
    await User.create({
      name: ADMIN_NAME?.trim() || "Administrator",
      email: normalizedEmail,
      password: passwordHash,
      role: "admin",
      approved: true,
    });
    console.log(`Admin account created for ${normalizedEmail}.`);
    return;
  }

  if (ADMIN_RESET_PASSWORD_ON_BOOT === "true") {
    admin.name = ADMIN_NAME?.trim() || admin.name;
    admin.password = passwordHash;
    admin.role = "admin";
    admin.approved = true;
    await admin.save();
    console.log(`Admin password reset from environment for ${normalizedEmail}.`);
    return;
  }

  console.log(`Admin account is ready for ${normalizedEmail}.`);
}

module.exports = { bootstrapAdmin };
