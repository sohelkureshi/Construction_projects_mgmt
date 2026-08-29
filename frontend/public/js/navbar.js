// public/js/navbar.js
document.addEventListener("DOMContentLoaded", function () {
  // Toggle User Menu Dropdown
  const userMenu = document.getElementById("userMenu");
  if (userMenu) {
    const dropdownToggle = userMenu.querySelector(".dropdown-toggle");
    dropdownToggle.addEventListener("click", function (e) {
      e.preventDefault();
      userMenu.classList.toggle("open");
    });
  }
  
  // Notifications Link Click Handler
  const notifLink = document.querySelector(".nav-links li a[href='/notifications']");
  if (notifLink) {
    notifLink.addEventListener("click", function (e) {
      e.preventDefault(); // Prevent the default navigation behavior
      // Show a formal message indicating there are no notifications
      alert("There are currently no new notifications.");
    });
  }
});
