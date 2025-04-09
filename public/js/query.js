document.addEventListener('DOMContentLoaded', async () => {
    console.log('Page loaded, setting up event listeners');
    
    // Load all books to populate filter options and initial display
    await loadAllBooks();
    
    // Set up filter button listeners
    document.getElementById('applyFilters').addEventListener('click', applyFilters);
    document.getElementById('clearFilters').addEventListener('click', clearFilters);
});

// Function to load all books and set up filter options
async function loadAllBooks() {
    try {
        const response = await fetch('/books');
        const books = await response.json();
        
        if (books.length === 0) {
            document.getElementById('filteredResults').innerHTML = `
                <div class="empty-state">
                    <p>Your reading list is empty. Start adding some books!</p>
                </div>
            `;
            return;
        }
        
        // Extract all unique tags for filtering
        const allTags = new Set();
        books.forEach(book => {
            if (book.tags && book.tags.length > 0) {
                book.tags.forEach(tag => allTags.add(tag));
            }
        });
        
        // Populate tag filters
        const tagFiltersContainer = document.getElementById('tagFilters');
        if (allTags.size > 0) {
            Array.from(allTags).forEach(tag => {
                const tagSpan = document.createElement('span');
                tagSpan.className = 'tag-filter';
                tagSpan.setAttribute('data-tag', tag);
                tagSpan.textContent = tag;
                tagSpan.addEventListener('click', () => {
                    tagSpan.classList.toggle('active');
                });
                tagFiltersContainer.appendChild(tagSpan);
            });
        } else {
            tagFiltersContainer.innerHTML = '<p>No tags available</p>';
        }
        
        // Display all books initially
        displayFilteredBooks(books);
        
    } catch (error) {
        console.error('Error loading books:', error);
        document.getElementById('filteredResults').innerHTML = `<p>Error loading books: ${error.message}</p>`;
    }
}

// Function to add book to reading list
function addToReadingList(title, author, year) {
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
        alert(`"${title}" has been added to your reading list!`);
        
        // Reload books to update the filtered list
        loadAllBooks();
    })
    .catch(error => {
        console.error('Error adding to reading list:', error);
        alert(`Error adding book to your list: ${error.message}`);
    });
}

// Function to apply all filters
async function applyFilters() {
    try {
        // Get all books first
        const response = await fetch('/books');
        const allBooks = await response.json();
        
        // Get filter values
        const statusFilter = document.getElementById('statusFilter').value;
        const yearMin = document.getElementById('yearMin').value ? parseInt(document.getElementById('yearMin').value) : null;
        const yearMax = document.getElementById('yearMax').value ? parseInt(document.getElementById('yearMax').value) : null;
        const activeTagFilters = Array.from(document.querySelectorAll('.tag-filter.active')).map(el => el.getAttribute('data-tag'));
        
        // Apply filters
        const filteredBooks = allBooks.filter(book => {
            // Filter by status
            if (statusFilter !== 'all' && book.status !== statusFilter) {
                return false;
            }
            
            // Filter by year range
            if (yearMin && book.publishYear < yearMin) {
                return false;
            }
            if (yearMax && book.publishYear > yearMax) {
                return false;
            }
            
            // Filter by tags
            if (activeTagFilters.length > 0) {
                if (!book.tags || book.tags.length === 0) {
                    return false;
                }
                
                // Check if book has at least one of the selected tags
                const hasMatchingTag = activeTagFilters.some(tag => book.tags.includes(tag));
                if (!hasMatchingTag) {
                    return false;
                }
            }
            
            return true;
        });
        
        // Display filtered books
        displayFilteredBooks(filteredBooks);
        
    } catch (error) {
        console.error('Error applying filters:', error);
        document.getElementById('filteredResults').innerHTML = `<p>Error filtering books: ${error.message}</p>`;
    }
}

// Function to display filtered books
function displayFilteredBooks(books) {
    const filteredResultsDiv = document.getElementById('filteredResults');
    
    if (books.length === 0) {
        filteredResultsDiv.innerHTML = `
            <div class="empty-state">
                <p>No books match your filters.</p>
                <p>Try adjusting your filter criteria or add more books to your list.</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    books.forEach(book => {
        // Generate cover URL using the title and author
        const encodedTitle = encodeURIComponent(book.title);
        const encodedAuthor = encodeURIComponent(book.author);
        const apiUrl = `https://bookcover.longitood.com/bookcover?book_title=${encodedTitle}&author_name=${encodedAuthor}`;
        
        // Format date
        const date = book.addedDate ? new Date(book.addedDate).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        }) : 'Date not available';
        
        // Create tag list HTML
        let tagsHtml = '';
        if (book.tags && book.tags.length > 0) {
            tagsHtml = '<div class="book-tags">';
            book.tags.forEach(tag => {
                tagsHtml += `<span class="tag">${tag} </span>`;
            });
            tagsHtml += '</div>';
        }
        
        html += `
            <div class="book-card" data-id="${book._id}">
                <div class="book-cover-container">
                    <img src="/img/loading-cover.gif" alt="${book.title}" class="book-cover" data-api-url="${apiUrl}">
                </div>
                <div class="book-info">
                    <div class="book-title">${book.title}</div>
                    <div class="book-author">by ${book.author}</div>
                    <div class="book-year">${book.publishYear}</div>
                    <div class="book-status">Status: ${book.status}</div>
                    <div class="book-date">Added: ${date}</div>
                    ${tagsHtml}
                </div>
            </div>
        `;
    });
    
    filteredResultsDiv.innerHTML = html;
    
    // Load cover images
    loadCoverImages();
}

// Function to load book cover images
function loadCoverImages() {
    const coverImages = document.querySelectorAll('.book-cover[data-api-url]');
    coverImages.forEach(async (img) => {
        try {
            const apiUrl = img.getAttribute('data-api-url');
            const response = await fetch(apiUrl);
            
            if (response.ok) {
                const data = await response.json();
                if (data.url) {
                    img.src = data.url;
                } else {
                    img.src = '/img/default-cover.jpg';
                }
            } else {
                img.src = '/img/default-cover.jpg';
            }
        } catch (error) {
            console.error('Error fetching book cover:', error);
            img.src = '/img/default-cover.jpg';
        }
    });
}

// Function to clear all filters
function clearFilters() {
    // Reset status filter
    document.getElementById('statusFilter').value = 'all';
    
    // Reset year filters
    document.getElementById('yearMin').value = '';
    document.getElementById('yearMax').value = '';
    
    // Reset tag filters
    document.querySelectorAll('.tag-filter.active').forEach(tag => {
        tag.classList.remove('active');
    });
    
    // Reload all books
    loadAllBooks();
}