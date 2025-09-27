// SPDX-FileCopyrightText: 2025 Sohel Kureshi
// SPDX-License-Identifier: MIT

document
        .querySelector(".password-toggle")
        .addEventListener("click", function () {
          const passwordField = document.getElementById("password");
          const type =
            passwordField.getAttribute("type") === "password"
              ? "text"
              : "password";
          passwordField.setAttribute("type", type);
          this.classList.toggle("fa-eye-slash");
        });

      document
        .getElementById("loginForm")
        .addEventListener("submit", async (e) => {
          e.preventDefault();
          const email = document.getElementById("email").value;
          const password = document.getElementById("password").value;

          try {
            const res = await fetch("/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (data.message === "Login successful") {
              window.location.href = data.redirect || "/dashboard";
            } else {
              alert(data.message);
            }
          } catch (error) {
            console.error("Login error:", error);
            alert("An error occurred during login. Please try again.");
          }
        });
