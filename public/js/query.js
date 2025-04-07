document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, setting up event listeners');
    
    const queryForm = document.getElementById('queryForm');
    if (queryForm) {
        queryForm.addEventListener('submit', handleSearch);
        console.log('Query form found and listener attached');
    } else {
        console.error('Query form not found!');
    }
});

async function handleSearch(e) {
    e.preventDefault();
    console.log('Search submitted');
    
    const searchTerm = document.getElementById('searchTerm').value.trim();
    const resultsDiv = document.getElementById('results');
    
    if (!searchTerm) {
        resultsDiv.innerHTML = '<p>Please enter a search term</p>';
        return;
    }
    
    // Show searching message
    resultsDiv.innerHTML = '<p>Searching for books matching "' + searchTerm + '"...</p>';
    
    try {
        // Use Open Library Search API
        const encodedSearch = encodeURIComponent(searchTerm);
        const url = `https://openlibrary.org/search.json?q=${encodedSearch}&limit=10`;
        console.log('Fetching from URL:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Received data:', data);
        
        if (!data.docs || data.docs.length === 0) {
            resultsDiv.innerHTML = `
                <div class="empty-results">
                    <p>No books found for "${searchTerm}".</p>
                    <p>Try a different search term or check the spelling.</p>
                </div>
            `;
            return;
        }
        
        // Create HTML for search results
        let html = `<h2>Found ${data.docs.length} books matching "${searchTerm}"</h2><div class="book-grid">`;
        
        data.docs.forEach(book => {
            // Get cover image URL
            let coverUrl = '/img/default-cover.jpg';
            if (book.cover_i) {
                coverUrl = `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
            }
            
            // Get publish year
            const publishYear = book.first_publish_year || (book.publish_year ? book.publish_year[0] : 'Unknown');
            
            // Get author
            const author = book.author_name ? book.author_name[0] : 'Unknown Author';
            
            html += `
                <div class="book-card">
                    <div class="book-cover-container">
                        <img src="${coverUrl}" alt="${book.title || 'Book cover'}" class="book-cover">
                    </div>
                    <div class="book-info">
                        <div class="book-title">${book.title || 'Unknown Title'}</div>
                        <div class="book-author">by ${author}</div>
                        <div class="book-year">${publishYear}</div>
                        <div class="card-actions">
                            <button class="add-to-list-btn" onclick="addToReadingList(this, '${book.title.replace(/'/g, "\\'")}', '${author.replace(/'/g, "\\'")}', ${publishYear})">Add to Reading List</button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        resultsDiv.innerHTML = html;
        
    } catch (error) {
        console.error('Search error:', error);
        resultsDiv.innerHTML = `<p>Error searching for books: ${error.message}</p>`;
    }
}

function addToReadingList(button, title, author, year) {
    console.log('Adding to reading list:', title, author, year);
    
    const bookData = {
        title: title,
        author: author,
        publishYear: parseInt(year) || new Date().getFullYear(),
        status: 'To Read',
        tags: []
    };
    
    fetch('/book', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to add book: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        // Update button to show success
        button.textContent = 'Added to Your List!';
        button.style.backgroundColor = '#27ae60';
        button.disabled = true;
        
        alert(`"${title}" has been added to your reading list!`);
    })
    .catch(error => {
        console.error('Error adding to reading list:', error);
        alert(`Error adding book to your list: ${error.message}`);
    });
}