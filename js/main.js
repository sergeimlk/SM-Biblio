/**
 * Main JavaScript file for Bibliomaniac
 * Handles data fetching from Google Books API, page rendering, and search functionality
 */

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

async function getGoogleBooks() {
    try {
        // Check if we have cached data
        const cachedData = localStorage.getItem('bibliomaniac_books');
        const cacheTimestamp = localStorage.getItem('bibliomaniac_books_timestamp');
        const now = Date.now();
        const cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours

        // Return cached data if it's still valid
        if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp)) < cacheExpiry) {
            console.log('Using cached book data');
            return JSON.parse(cachedData);
        }

        console.log('Fetching fresh book data from Google Books API');

        // Search for free books available for reading
        const queries = [
            'subject:fiction+filter:free-ebooks',
            'subject:classics+filter:free-ebooks',
            'subject:science+fiction+filter:free-ebooks',
            'subject:fantasy+filter:free-ebooks',
            'subject:mystery+filter:free-ebooks'
        ];

        const allBooks = [];

        for (const query of queries) {
            const response = await fetch(`${GOOGLE_BOOKS_API}?q=${query}&maxResults=8&langRestrict=en`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.items) {
                allBooks.push(...data.items);
            }
        }

        // Transform Google Books data to our format
        const books = allBooks.slice(0, 20).map((item, index) => {
            const volumeInfo = item.volumeInfo;
            const saleInfo = item.saleInfo;

            return {
                id: item.id, // Use Google Books ID as the primary identifier
                googleId: item.id,
                title: volumeInfo.title || 'Unknown Title',
                author: volumeInfo.authors ? volumeInfo.authors[0] : 'Unknown Author',
                aboutAuthor: volumeInfo.description ? volumeInfo.description.substring(0, 300) + '...' : 'No description available.',
                price: saleInfo.saleability === 'FREE' ? 'Free' : (saleInfo.listPrice ? `$${saleInfo.listPrice.amount}` : 'Free'),
                numberOfBooks: Math.floor(Math.random() * 10) + 1,
                rating: volumeInfo.averageRating || Math.floor(Math.random() * 3) + 3,
                image: volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail || 'assets/images/metamo.png',
                category: volumeInfo.categories ? volumeInfo.categories[0] : 'General',
                publicationDate: volumeInfo.publishedDate || 'Unknown',
                description: volumeInfo.description || 'No description available.',
                previewLink: volumeInfo.previewLink,
                infoLink: volumeInfo.infoLink
            };
        });

        const result = { books };

        // Cache the data
        localStorage.setItem('bibliomaniac_books', JSON.stringify(result));
        localStorage.setItem('bibliomaniac_books_timestamp', now.toString());

        return result;
    } catch (error) {
        console.error("Erreur lors du chargement des données:", error);

        // Try to return cached data even if expired, as fallback
        const cachedData = localStorage.getItem('bibliomaniac_books');
        if (cachedData) {
            console.log('Using expired cached data as fallback');
            return JSON.parse(cachedData);
        }

        return null;
    }
}

function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function generateStars(rating) {
    const maxStars = 5;
    const fullStars = Math.floor(rating);
    const emptyStars = maxStars - fullStars;
    return '★'.repeat(fullStars) + '☆'.repeat(emptyStars);
}

async function init() {
    const data = await getGoogleBooks();
    if (!data) return;

    const path = window.location.pathname;
    const page = path.split("/").pop();

    // Determine current page based on filename or specific elements
    if (page === 'index.html' || page === '' || document.querySelector('.popular')) {
        renderIndexPage(data);
    } else if (page === 'mes-livres.html' || document.getElementById('book-list')) {
        renderMesLivresPage(data);
    } else if (page === 'user.html' || document.getElementById('favorite-books-container')) {
        renderUserPage(data);
    } else if (page === 'bookDetails.html' || document.getElementById('bookDetails-container')) {
        renderBookDetailsPage(data);
    } else if (page === 'authorDetails.html' || document.getElementById('author-details')) {
        renderAuthorDetailsPage(data);
    }

    // Global event listeners
    setupGlobalListeners(data);
}

function renderIndexPage(data) {
    // Render recent activities (first 4 books)
    const recentContainer = document.getElementById("recent-carousel");
    if (recentContainer) {
        recentContainer.innerHTML = "";
        data.books.slice(0, 4).forEach((book) => {
            const bookCard = createBookCard(book);
            recentContainer.appendChild(bookCard);
        });
    }

    // Render popular section (all books)
    const popularContainer = document.querySelector(".popular .carousel");
    if (!popularContainer) return;

    popularContainer.innerHTML = "";

    // Render all books in the popular section
    data.books.forEach((book) => {
        const bookCard = createBookCard(book);
        popularContainer.appendChild(bookCard);
    });
}

function renderMesLivresPage(data) {
    const bookListContainer = document.getElementById("book-list");
    if (!bookListContainer) return;

    const favRadio = document.getElementById('fav');
    const downRadio = document.getElementById('down');
    const searchInput = document.getElementById('search-input');

    let currentFilter = 'fav'; // Default
    let searchTerm = '';

    const filterAndRender = () => {
        bookListContainer.innerHTML = "";

        let filteredBooks = data.books;

        // Filter by tab
        if (currentFilter === 'down') {
            // Simulate downloaded books (e.g., every other book)
            filteredBooks = filteredBooks.filter((book, index) => index % 2 === 0);
        }
        // 'fav' shows all for now

        // Filter by search
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            filteredBooks = filteredBooks.filter(book =>
                book.title.toLowerCase().includes(lowerTerm) ||
                book.author.toLowerCase().includes(lowerTerm)
            );
        }

        if (filteredBooks.length === 0) {
            bookListContainer.innerHTML = "<p style='text-align:center; width:100%; color: var(--color-text-secondary); margin-top: 2rem;'>Aucun livre trouvé.</p>";
        } else {
            filteredBooks.forEach((book) => {
                const bookCard = createBookCard(book);
                bookListContainer.appendChild(bookCard);
            });
        }
    };

    // Event Listeners
    if (favRadio) {
        favRadio.addEventListener('change', () => {
            if (favRadio.checked) {
                currentFilter = 'fav';
                filterAndRender();
            }
        });
    }

    if (downRadio) {
        downRadio.addEventListener('change', () => {
            if (downRadio.checked) {
                currentFilter = 'down';
                filterAndRender();
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value;
            filterAndRender();
        });
    }

    // Initial render
    filterAndRender();
}

function renderUserPage(data) {
    const favoriteContainer = document.getElementById('favorite-books-container');
    if (!favoriteContainer) return;

    // Display first 4 books as favorites
    const favoriteBooks = data.books.slice(0, 4);

    favoriteContainer.innerHTML = '';
    favoriteBooks.forEach((book) => {
        const bookCard = createBookCard(book);
        favoriteContainer.appendChild(bookCard);
    });
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
    bookRating.textContent = generateStars(book.rating);

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

function renderBookDetailsPage(data) {
    const bookDetailsContainer = document.getElementById("bookDetails-container");
    if (!bookDetailsContainer) return;

    const id = getUrlParameter("id");
    if (!id) {
        // Hide loader
        const loader = document.getElementById('book-loader');
        if (loader) loader.classList.add('hidden');

        bookDetailsContainer.innerHTML = "<p>Livre non spécifié.</p>";
        return;
    }

    const selectedBook = data.books.find((book) => book.id === id);

    // Hide loader
    const loader = document.getElementById('book-loader');
    if (loader) loader.classList.add('hidden');

    if (selectedBook) {
        bookDetailsContainer.innerHTML = `
      <img src="${selectedBook.image}" alt="${selectedBook.title}" />
      <div style="flex: 1;">
        <h3 class="details-title">${selectedBook.title}</h3>
        <span class="book-info">
            <p class="book-author"> ${selectedBook.author}</p>
            <p class="book-date">Date de publication : ${selectedBook.publicationDate}</p>
        </span>
        <span class="solid-stars" aria-label="Évaluation du livre : ${selectedBook.rating} étoiles">
            ${generateStars(selectedBook.rating)}
        </span>
        <div class="cta">
            <button class="cta-btn-phones" id="audio-book-btn" aria-label="Écouter la version audio">
              <span class="text-audio">Version audio</span>
              <i class="fa-solid fa-headphones"></i>
            </button>
            <button class="cta-btn-read" id="read-book-btn" aria-label="Lire le livre">
              lire le livre
            </button>
        </div>
      </div>
    `;

        // Update breadcrumb title
        const breadcrumbTitle = document.getElementById('breadcrumb-title');
        if (breadcrumbTitle) {
            breadcrumbTitle.textContent = selectedBook.title;
        }

        const linkAuthor = document.getElementById("link-author");
        if (linkAuthor) {
            linkAuthor.href = `authorDetails.html?id=${selectedBook.id}`;
        }

        const aboutContainer = document.querySelector(".about-container .about");
        if (aboutContainer) {
            aboutContainer.innerHTML = `
        <h2>À propos de cet e-book</h2>
        <br />
        <p>${selectedBook.description}</p>
        ${selectedBook.previewLink ? `<br /><a href="${selectedBook.previewLink}" target="_blank" style="color: var(--color-accent); text-decoration: underline;">Lire un aperçu sur Google Books</a>` : ''}
        `;
        }

        // Add event listener for read button
        const readBookBtn = document.getElementById('read-book-btn');
        if (readBookBtn) {
            readBookBtn.addEventListener('click', () => {
                window.location.href = `reader.html?id=${selectedBook.id}`;
            });
        }

        // Add event listener for audio button
        const audioBookBtn = document.getElementById('audio-book-btn');
        if (audioBookBtn) {
            audioBookBtn.addEventListener('click', () => {
                alert("La version audio de ce livre n'est pas encore disponible.");
            });
        }
    } else {
        bookDetailsContainer.innerHTML = "<p>Livre non trouvé.</p>";
    }
}

function renderAuthorDetailsPage(data) {
    const authorContainer = document.getElementById("author-details");
    const aboutContainer = document.querySelector(".about-container");
    if (!authorContainer) return;

    const id = getUrlParameter("id");
    const selectedAuthor = data.books.find((book) => book.id === id);

    if (selectedAuthor) {
        authorContainer.innerHTML = `
      <h3 class="details-title">${selectedAuthor.author}</h3>
      <span class="author-info">
        <p class="book-author"> <i class="fa-solid fa-book-open" aria-hidden="true"></i> ${selectedAuthor.numberOfBooks} books </p>
      </span>
    `;

        if (aboutContainer) {
            aboutContainer.innerHTML = `
        <br />
        <h2>À propos de cet auteur</h2>
        <br />
        <p>${selectedAuthor.aboutAuthor}</p>
        `;
        }

        const linkBook = document.getElementById("link-book");
        if (linkBook) {
            linkBook.href = `bookDetails.html?id=${selectedAuthor.id}`;
        }
    } else {
        authorContainer.innerHTML = "<p>Auteur non trouvé.</p>";
    }
}

function setupGlobalListeners(data) {
    // Back button
    const backButton = document.querySelector('.back-button');
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.history.back();
        });
    }

    // Search functionality for Index page
    const searchInput = document.getElementById('search-input');
    // Only attach if we are NOT on mes-livres.html, because mes-livres handles its own search
    if (searchInput && !document.getElementById('book-list')) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            handleSearch(searchTerm, data);
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

function handleSearch(searchTerm, data) {
    const popularContainer = document.querySelector(".popular .carousel");

    // Filter logic
    const filteredBooks = data.books.filter(book =>
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm)
    );

    // Update Popular Section
    if (popularContainer) {
        popularContainer.innerHTML = "";
        if (filteredBooks.length > 0) {
            filteredBooks.forEach(book => {
                popularContainer.appendChild(createBookCard(book));
            });
        } else {
            popularContainer.innerHTML = "<p>Aucun livre trouvé.</p>";
        }
    }
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
