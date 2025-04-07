document.addEventListener('DOMContentLoaded', () => {
    const bookForm = document.getElementById('bookForm');
    bookForm.addEventListener('submit', handleFormSubmit);
});

async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Process tags - split by comma and trim whitespace
    const tagsInput = document.getElementById('tags').value;
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : [];
    
    const formData = {
        title: document.getElementById('title').value,
        author: document.getElementById('author').value,
        publishYear: document.getElementById('publishYear').value,
        status: document.getElementById('status').value,
        tags: tags
    };
    
    try {
        const response = await fetch('/book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            const messageElement = document.getElementById('message');
            messageElement.textContent = '✓ Book added successfully to your reading list!';
            messageElement.className = 'success-message';
            document.getElementById('bookForm').reset();
            
            // Clear message after 5 seconds
            setTimeout(() => {
                messageElement.textContent = '';
                messageElement.className = '';
            }, 5000);
        } else {
            const messageElement = document.getElementById('message');
            messageElement.textContent = `Error: ${data.message}`;
            messageElement.className = 'error-message';
        }
    } catch (error) {
        const messageElement = document.getElementById('message');
        messageElement.textContent = `Error: ${error.message}`;
        messageElement.className = 'error-message';
    }
}