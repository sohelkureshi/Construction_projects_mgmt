// Toggle form visibility
function toggleForm(formId) {
    const form = document.getElementById(formId);
    if (form.style.display === "block") {
      form.style.display = "none";
    } else {
      form.style.display = "block";
    }
  }

  // Set up event listeners for toggle buttons
  document
    .getElementById("toggleDrawingForm")
    .addEventListener("click", () => {
      toggleForm("drawingForm");
    });

  document
    .getElementById("toggleTenderForm")
    .addEventListener("click", () => {
      toggleForm("tenderForm");
    });

  // Handle drawing upload form submission
  document
    .getElementById("drawingUploadForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = document.getElementById("drawingTitle").value;
      const link = document.getElementById("drawingLink").value;

      try {
        // Get project ID from URL
        const urlParts = window.location.pathname.split("/");
        const projectId = urlParts[urlParts.indexOf("documents") + 1];

        // Send data to server
        const response = await fetch(
          `/project/${projectId}/drawing/upload`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ title, link }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to upload drawing");
        }

        const data = await response.json();

        // Create new card element
        const card = document.createElement("div");
        card.className = "document-card";
        card.setAttribute("data-gdrive", link);

        // Format the card HTML
        card.innerHTML = `
          <img src="/images/gfloor.png" alt="${title}">
          <div class="document-info">
            <p class="title">${title}</p>
            <p class="date">${new Date().toLocaleDateString()}</p>
          </div>
        `;

        // Add click handler
        card.addEventListener("click", () => {
          const modal = document.getElementById("documentModal");
          const modalTitle = document.getElementById("modalTitle");
          const documentFrame = document.getElementById("documentFrame");

          modalTitle.textContent = title;
          documentFrame.src = link;
          modal.style.display = "flex";
        });

        // Add the card to the grid
        document.getElementById("drawingsGrid").prepend(card);

        // Reset form and hide it
        document.getElementById("drawingTitle").value = "";
        document.getElementById("drawingLink").value = "";
        toggleForm("drawingForm");

        alert("Drawing added successfully!");
      } catch (error) {
        console.error("Error uploading drawing:", error);
        alert(`Error: ${error.message}`);
      }
    });

  // Handle tender upload form submission
  document
    .getElementById("tenderUploadForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = document.getElementById("tenderTitle").value;
      const link = document.getElementById("tenderLink").value;

      try {
        // Get project ID from URL
        const urlParts = window.location.pathname.split("/");
        const projectId = urlParts[urlParts.indexOf("documents") + 1];

        // Send data to server
        const response = await fetch(
          `/project/${projectId}/tender/upload`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ title, link }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to upload tender document"
          );
        }

        const data = await response.json();

        // Create new card element
        const card = document.createElement("div");
        card.className = "document-card";
        card.setAttribute("data-gdrive", link);

        // Format the card HTML
        card.innerHTML = `
            <img src="/images/tender-image.png" alt="${title}">
            <div class="document-info">
                <p class="title">${title}</p>
                <p class="date">${new Date().toLocaleDateString()}</p>
            </div>
        `;

        // Add click handler
        card.addEventListener("click", () => {
          const modal = document.getElementById("documentModal");
          const modalTitle = document.getElementById("modalTitle");
          const documentFrame = document.getElementById("documentFrame");

          modalTitle.textContent = title;
          documentFrame.src = link;
          modal.style.display = "flex";
        });

        // Add the card to the grid
        document.getElementById("tendersGrid").prepend(card);

        // Reset form and hide it
        document.getElementById("tenderTitle").value = "";
        document.getElementById("tenderLink").value = "";
        toggleForm("tenderForm");

        alert("Tender document added successfully!");
      } catch (error) {
        console.error("Error uploading tender document:", error);
        alert(`Error: ${error.message}`);
      }
    });

  // Document card click handler (for existing cards)
  document.querySelectorAll(".document-card").forEach((card) => {
    card.addEventListener("click", () => {
      const link = card.getAttribute("data-gdrive");
      const title = card.querySelector(".title").textContent;

      // Open document in modal
      const modal = document.getElementById("documentModal");
      const modalTitle = document.getElementById("modalTitle");
      const documentFrame = document.getElementById("documentFrame");

      modalTitle.textContent = title;
      documentFrame.src = link;
      modal.style.display = "flex";
    });
  });

  // Close modal when close button is clicked
  document.querySelector(".close-button").addEventListener("click", () => {
    const modal = document.getElementById("documentModal");
    modal.style.display = "none";
    document.getElementById("documentFrame").src = "";
  });

  // Close modal when clicking outside the content
  document
    .getElementById("documentModal")
    .addEventListener("click", (e) => {
      if (e.target === document.getElementById("documentModal")) {
        document.getElementById("documentModal").style.display = "none";
        document.getElementById("documentFrame").src = "";
      }
    });