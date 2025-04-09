document.addEventListener('DOMContentLoaded', async () => {
    await loadBooks();
    
});

async function loadBooks() {
    try {
        const response = await fetch('/books');
        const books = await response.json();
        
        const bookListDiv = document.getElementById('bookList');
        
        if (books.length === 0) {
            bookListDiv.innerHTML = `
                <div class="empty-state">
                    <p>Your bookshelf is empty. Start adding some books!</p>
                </div>
            `;
        } else {
            // Extract all unique tags for filtering
            let allTags = new Set();
            books.forEach(book => {
                if (book.tags && book.tags.length > 0) {
                    book.tags.forEach(tag => allTags.add(tag));
                }
            });
            
            // Group books by status
            const booksByStatus = {
                'To Read': [],
                'In Progress': [],
                'Completed': [],
                'Did Not Finish': [],
            };
            
            books.forEach(book => {
                if (booksByStatus[book.status]) {
                    booksByStatus[book.status].push(book);
                } else {
                    booksByStatus['To Read'].push(book);
                }
            });
            
            // Create the kanban board
            let html = '<div class="kanban-board">';
            
            // Define the status order and icons
            const statusConfig = [
                { 
                    status: 'To Read', 
                    class: 'to-read-column',
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>'
                },
                { 
                    status: 'In Progress', 
                    class: 'in-progress-column',
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>'
                },
                { 
                    status: 'Completed', 
                    class: 'completed-column',
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
                },
                { 
                    status: 'Did Not Finish', 
                    class: 'did-not-finish-column',
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>'
                }
            ];
            
            // Create columns in the specified order
            statusConfig.forEach(config => {
                const statusBooks = booksByStatus[config.status] || [];
                const statusClass = config.status.replace(/\s+/g, '-').toLowerCase();
            
                html += `
                    <div class="kanban-column ${config.class} collapsible-column">
                        <div class="column-header" data-status="${config.status}">
                            <div class="column-title">
                                <span class="column-title-icon">${config.icon}</span>
                                ${config.status}
                            </div>
                            <span class="column-count">${statusBooks.length}</span>
                            <span class="collapse-icon">▼</span>
                        </div>
                        <div class="book-cards" data-status="${config.status}">
                `;
                                
                if (statusBooks.length === 0) {
                    html += `
                        <div class="empty-column">
                            <p>No books in this category</p>
                        </div>
                    `;
                } else {
                    statusBooks.forEach(book => {
                        // Generate cover URL using the title and author
                        const encodedTitle = encodeURIComponent(book.title);
                        const encodedAuthor = encodeURIComponent(book.author);
                        const apiUrl = `https://bookcover.longitood.com/bookcover?book_title=${encodedTitle}&author_name=${encodedAuthor}`;
                        
                        
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
                                tagsHtml += `<span class="tag">${tag}</span>`;
                            });
                            tagsHtml += '</div>';
                        }
                        
                        html += `
                            <div class="book-card ${statusClass}" data-id="${book._id}" data-tags="${book.tags ? book.tags.join(',') : ''}">
                                <div class="book-cover-container">
                                    <img src="/img/loading-cover.gif" alt="${book.title}" class="book-cover" data-api-url="${apiUrl}">
                                </div>
                                <div class="book-info">
                                    <div class="book-title">${book.title}</div>
                                    <div class="book-author">by ${book.author}</div>
                                    <div class="book-year">${book.publishYear}</div>
                                    <div class="Add-date">${date}</div>
                                    ${tagsHtml}
                                    <div class="status-selector">
                                        <select class="status-select" data-book-id="${book._id}">
                                            <option value="To Read" ${book.status === 'To Read' ? 'selected' : ''}>To Read</option>
                                            <option value="In Progress" ${book.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                                            <option value="Completed" ${book.status === 'Completed' ? 'selected' : ''}>Completed</option>
                                            <option value="Did Not Finish" ${book.status === 'Did Not Finish' ? 'selected' : ''}>Did Not Finish</option>
                                        </select>
                                    </div>
                                    <div class="card-actions">
                                        <button class="delete-btn" onclick="deleteBook('${book._id}')">Remove</button>
                                    </div>
                                </div>
                            </div>
                        `;
                    });
                }
                
                html += `
                        </div>
                    </div>
                `;
            });
            
            html += '</div>'; // Close kanban-board
            
            bookListDiv.innerHTML = html;

            document.querySelectorAll('.column-header').forEach(header => {
                header.addEventListener('click', () => {
                    const column = header.closest('.kanban-column');
                    column.classList.toggle('collapsed');
                });
            });
            
            // Add event listeners to status selects
            document.querySelectorAll('.status-select').forEach(select => {
                select.addEventListener('change', async (e) => {
                    const bookId = e.target.getAttribute('data-book-id');
                    const newStatus = e.target.value;
                    await updateBookStatus(bookId, newStatus);
                });
            });
            
            // Add event listeners to tag filters if they exist
            const tagFilters = document.querySelectorAll('.tag-filter');
            if (tagFilters.length > 0) {
                tagFilters.forEach(filter => {
                    filter.addEventListener('click', () => {
                        filter.classList.toggle('active');
                        applyTagFilters();
                    });
                });
                
                // Clear filters button
                const clearBtn = document.getElementById('clear-filters');
                if (clearBtn) {
                    clearBtn.addEventListener('click', () => {
                        document.querySelectorAll('.tag-filter').forEach(f => f.classList.remove('active'));
                        document.querySelectorAll('.book-card').forEach(card => card.style.display = 'flex');
                    });
                }
            }
            
            // Now load the cover images after rendering the HTML
            const coverImages = document.querySelectorAll('.book-cover');
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
    } catch (error) {
        document.getElementById('bookList').innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

// Function to apply tag filters
function applyTagFilters() {
    const activeFilters = Array.from(document.querySelectorAll('.tag-filter.active')).map(f => f.getAttribute('data-tag'));
    const bookCards = document.querySelectorAll('.book-card');
    
    if (activeFilters.length === 0) {
        // If no filters are active, show all books
        bookCards.forEach(card => card.style.display = 'flex');
        
        // Check if columns are empty
        checkEmptyColumns();
    } else {
        // Otherwise, filter books based on selected tags
        bookCards.forEach(card => {
            const cardTags = card.getAttribute('data-tags').split(',').filter(t => t);
            const matchesFilter = activeFilters.some(filter => cardTags.includes(filter));
            card.style.display = matchesFilter ? 'flex' : 'none';
        });
        
        // Check if columns are empty after filtering
        checkEmptyColumns();
    }
}

// Function to check if columns are empty after filtering
function checkEmptyColumns() {
    document.querySelectorAll('.book-cards').forEach(column => {
        const visibleCards = column.querySelectorAll('.book-card[style="display: flex;"], .book-card:not([style*="display"])').length;
        
        let emptyColumnDiv = column.querySelector('.empty-column');
        
        if (visibleCards === 0) {
            if (!emptyColumnDiv) {
                emptyColumnDiv = document.createElement('div');
                emptyColumnDiv.className = 'empty-column';
                emptyColumnDiv.innerHTML = '<p>No books match your filter</p>';
                column.appendChild(emptyColumnDiv);
            }
        } else {
            if (emptyColumnDiv) {
                emptyColumnDiv.remove();
            }
        }
    });
}

async function updateBookStatus(bookId, newStatus) {
    try {
        const response = await fetch(`/book/update/${bookId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update book status');
        }
        
        await loadBooks(); // Reload the book list to reflect changes
    } catch (error) {
        console.error('Error updating book status:', error);
        alert(`Error: ${error.message}`);
    }
}

async function deleteBook(bookId) {
    if (confirm('Are you sure you want to remove this book from your reading list?')) {
        try {
            console.log(`Sending POST request to delete book ID: ${bookId}`);
            
            const response = await fetch(`/book/delete/${bookId}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const text = await response.text();
                console.error("Server response:", text);
                throw new Error(`Server returned ${response.status}: ${text}`);
            }
            
            // Try to parse as JSON
            try {
                const data = await response.json();
                console.log("Delete operation successful:", data);
                // Reload the book list after successful deletion
                await loadBooks();
            } catch (parseError) {
                // If JSON parsing fails, log the raw response
                const text = await response.text();
                console.error("Failed to parse server response as JSON:", text);
                throw new Error("Server returned an invalid response format");
            }
        } catch (error) {
            console.error("Error during delete operation:", error);
            alert(`Error: ${error.message}`);
        }
    }
}