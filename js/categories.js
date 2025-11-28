/**
 * Categories Page JavaScript
 * Handles category filtering and display
 */

function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

async function loadBooks() {
    // Get book data from localStorage
    const cachedData = localStorage.getItem('bibliomaniac_books');
    if (!cachedData) {
        alert('Données des livres non trouvées');
        window.location.href = 'index.html';
        return null;
    }

    return JSON.parse(cachedData);
}

function createBookCard(book) {
    const bookCard = document.createElement("div");
    bookCard.classList.add("book-card");

    const bookLink = document.createElement("a");
    bookLink.href = `bookDetails.html?id=${book.id}`;
    bookLink.classList.add("book-link");

    const bookImageDiv = document.createElement("div");
    bookImageDiv.classList.add("book-image");
    const bookImage = document.createElement("img");
    bookImage.src = book.image;
    bookImage.alt = book.title;
    bookImageDiv.appendChild(bookImage);

    const bookInfosDiv = document.createElement("div");
    bookInfosDiv.classList.add("book-infos-container");

    const bookTitle = document.createElement("div");
    bookTitle.classList.add("book-title");
    bookTitle.textContent = book.title;

    const bookAuthor = document.createElement("div");
    bookAuthor.classList.add("book-author");
    bookAuthor.textContent = book.author;

    const bookRating = document.createElement("div");
    bookRating.classList.add("book-rating");
    const maxStars = 5;
    const fullStars = Math.floor(book.rating);
    const emptyStars = maxStars - fullStars;
    bookRating.textContent = '★'.repeat(fullStars) + '☆'.repeat(emptyStars);

    const bookPrice = document.createElement("div");
    bookPrice.classList.add("book-price");
    bookPrice.textContent = book.price;

    bookInfosDiv.appendChild(bookTitle);
    bookInfosDiv.appendChild(bookAuthor);
    bookInfosDiv.appendChild(bookRating);
    bookInfosDiv.appendChild(bookPrice);

    bookLink.appendChild(bookImageDiv);
    bookLink.appendChild(bookInfosDiv);
    bookCard.appendChild(bookLink);

    return bookCard;
}

function filterBooksByCategory(books, category) {
    // Map category names to search terms
    const categoryMap = {
        'fiction': 'fiction',
        'classics': 'classic',
        'science-fiction': 'science',
        'fantasy': 'fantasy',
        'mystery': 'mystery'
    };

    const searchTerm = categoryMap[category] || category;

    // Filter books by category
    return books.filter(book =>
        book.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
}

function renderBooks(category) {
    const bookListContainer = document.getElementById('category-book-list');
    if (!bookListContainer) return;

    loadBooks().then(data => {
        if (!data) return;

        bookListContainer.innerHTML = '';

        const filteredBooks = filterBooksByCategory(data.books, category);

        if (filteredBooks.length === 0) {
            bookListContainer.innerHTML = `
                <p style="text-align:center; width:100%; color: var(--color-text-secondary); margin-top: 2rem; grid-column: 1 / -1;">
                    Aucun livre trouvé dans cette catégorie.
                </p>
            `;
        } else {
            filteredBooks.forEach(book => {
                const bookCard = createBookCard(book);
                bookListContainer.appendChild(bookCard);
            });
        }
    });
}

function setupTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const categoryTitle = document.getElementById('category-title');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));

            // Add active class to clicked tab
            tab.classList.add('active');

            // Get category
            const category = tab.dataset.category;

            // Update title
            categoryTitle.textContent = `Catégorie: ${tab.textContent}`;

            // Update URL
            const url = new URL(window.location);
            url.searchParams.set('category', category);
            window.history.pushState({}, '', url);

            // Render books
            renderBooks(category);
        });
    });
}

function init() {
    // Get category from URL
    const category = getUrlParameter('category') || 'fiction';

    // Set active tab
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        if (tab.dataset.category === category) {
            tab.classList.add('active');
            document.getElementById('category-title').textContent = `Catégorie: ${tab.textContent}`;
        } else {
            tab.classList.remove('active');
        }
    });

    // Setup tabs
    setupTabs();

    // Render books for current category
    renderBooks(category);

    // Back button
    const backButton = document.querySelector('.back-button');
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.history.back();
        });
    }

    // Mobile Search Toggle
    const mobileSearchToggle = document.getElementById('mobile-search-toggle');
    const searchBar = document.getElementById('search-bar');
    if (mobileSearchToggle && searchBar) {
        mobileSearchToggle.addEventListener('click', () => {
            searchBar.classList.toggle('active');
            if (searchBar.classList.contains('active')) {
                const input = searchBar.querySelector('input');
                if (input) input.focus();
            }
        });
    }
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
