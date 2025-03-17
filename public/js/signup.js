// Signup form submission
document
.getElementById("signupForm")
.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value; // new field

  try {
    const res = await fetch("/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok && data.redirect) {
      window.location.href = data.redirect;
    }
  } catch (error) {
    console.error("Error during signup:", error);
    alert("An error occurred during signup. Please try again.");
  }
});

// Smooth scroll for navigation (if needed)
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
anchor.addEventListener("click", function (e) {
  e.preventDefault();
  document.querySelector(this.getAttribute("href")).scrollIntoView({
    behavior: "smooth",
  });
});
});