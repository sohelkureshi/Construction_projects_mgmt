const form = document.getElementById('linkForm');
const titleInput = document.getElementById('titleInput');
const urlInput = document.getElementById('urlInput');
const cardContainer = document.getElementById('cardContainer');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = titleInput.value;
  const driveUrl = urlInput.value;

  try {
    const res = await fetch('/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, driveUrl })
    });
    
    if (!res.ok) {
      // console.error('Error adding link');
      return;
    }

    const newLink = await res.json();
    addCardToDOM(newLink);

    // Clear inputs
    titleInput.value = '';
    urlInput.value = '';
  } catch (error) {
    // console.error('Error:', error);
  }
});

function addCardToDOM(link) {
  const div = document.createElement('div');
  div.classList.add('drawing-card');
  div.dataset.gdrive = link.driveUrl;

  div.innerHTML = `
    <img 
      src="/images/tender-image.png" 
      alt="New Document" 
      loading="lazy" 
      width="250" 
      height="200"
    >
    <p>${link.title}</p>
  `;

  // Clicking this new card opens Google Drive link
  div.addEventListener('click', () => {
    window.open(link.driveUrl, '_blank');
  });

  cardContainer.appendChild(div);
}

// Load existing links from DB on page load
async function loadLinks() {
  try {
    const res = await fetch('/links');
    if (!res.ok) return;
    const links = await res.json();
    links.forEach(link => addCardToDOM(link));
  } catch (error) {
    // console.error('Error loading links:', error);
  }
}

loadLinks();