document.addEventListener("DOMContentLoaded", function () {
    const userRole = "<%= user ? user.role : '' %>";
    const allowedRoles = ["manager", "contractor", "admin"];

    if (!allowedRoles.includes(userRole)) {
      window.location.href = "/dashboard";
    }
  });