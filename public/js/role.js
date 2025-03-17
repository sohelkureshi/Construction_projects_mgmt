    // Listen for toggle switch changes
    document.querySelectorAll('.approval-toggle').forEach(function(toggle) {
        toggle.addEventListener('change', function() {
          const userId = this.getAttribute('data-userid');
          const approved = this.checked; // true if approved, false if rejected
  
          // Determine the API endpoint based on the approval state
          const url = approved ? `/admin/approve-user/${userId}` : `/admin/reject-user/${userId}`;
          
          // Send a POST request to update the user’s approval status
          fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ approved })
          })
          .then(response => response.json())
          .then(data => {
            alert(data.message);
          })
          .catch(error => {
            console.error("Error updating user approval:", error);
            alert("There was an error updating the user status.");
          });
        });
      });