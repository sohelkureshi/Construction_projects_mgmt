document.addEventListener("DOMContentLoaded", function() {
    const userMenu = document.getElementById("userMenu");
    const dropdownToggle = userMenu.querySelector(".dropdown-toggle");

    dropdownToggle.addEventListener("click", function(e) {
      e.preventDefault(); // Prevent default link behavior
      userMenu.classList.toggle("open"); // Toggle the open class to show/hide the dropdown
    });
  });