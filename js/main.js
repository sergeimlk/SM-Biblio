
/**
 * Main JavaScript file for Bibliomaniac
 * Handles data fetching and page rendering
 */

const DATA_URL = 'assets/data/datas.json';

async function getData() {
    try {
        const response = await fetch(DATA_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        return null;
    }
}

function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function generateStars(rating) {
    const maxStars = 5;
    const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(maxStars - Math.floor(rating));
    return stars;
}

async function init() {
    const data = await getData();
    if (!data) return;

    const path = window.location.pathname;
    const page = path.split("/").pop();

    // Determine current page based on filename or specific elements
    if (page === 'index.html' || page === '' || document.querySelector('.popular')) {
        renderIndexPage(data);
    } else if (page === 'mes-livres.html' || document.getElementById('book-list')) {
        renderMesLivresPage(data);
    } else if (page === 'bookDetails.html' || document.getElementById('bookDetails-container')) {
        renderBookDetailsPage(data);
    } else if (page === 'authorDetails.html' || document.getElementById('author-details')) {
        renderAuthorDetailsPage(data);
    }

    // Global event listeners
    setupGlobalListeners();
}

function renderIndexPage(data) {
    const popularContainer = document.querySelector(".popular .carousel");
    if (!popularContainer) return;

    popularContainer.innerHTML = "";

    data.books.forEach((book) => {
        const bookCard = document.createElement("div");
        bookCard.classList.add("book-card");

        const bookLink = document.createElement("a");
        bookLink.href = `bookDetails.html?id=${book.id}`;
        bookLink.classList.add("book-link");
        bookLink.style.textDecoration = 'none';

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
        popularContainer.appendChild(bookCard);
    });
}

function renderMesLivresPage(data) {
    const bookListContainer = document.getElementById("book-list");
    if (!bookListContainer) return;

    bookListContainer.innerHTML = "";

    data.books.forEach((book) => {
        const bookDiv = document.createElement("div");
        bookDiv.classList.add("book");

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
        bookRating.textContent = `${generateStars(book.rating)} Note`;

        const bookPrice = document.createElement("div");
        bookPrice.classList.add("book-price");
        bookPrice.textContent = book.price;

        const bookmark = document.createElement("div");
        bookmark.classList.add("bookmark");
        bookmark.innerHTML = "&#9733;";

        bookInfosDiv.appendChild(bookTitle);
        bookInfosDiv.appendChild(bookAuthor);
        bookInfosDiv.appendChild(bookRating);
        bookInfosDiv.appendChild(bookPrice);
        bookInfosDiv.appendChild(bookmark);

        bookLink.appendChild(bookImageDiv);
        bookLink.appendChild(bookInfosDiv);
        bookDiv.appendChild(bookLink);
        bookListContainer.appendChild(bookDiv);
    });
}

function renderBookDetailsPage(data) {
    const bookDetailsContainer = document.getElementById("bookDetails-container");
    if (!bookDetailsContainer) return;

    const id = Number(getUrlParameter("id"));
    if (!id) {
        bookDetailsContainer.innerHTML = "<p>Livre non spécifié.</p>";
        return;
    }

    const selectedBook = data.books.find((book) => book.id === id);

    if (selectedBook) {
        bookDetailsContainer.innerHTML = `
      <img src="${selectedBook.image}" alt="${selectedBook.title}" />
      <h3 class="details-title">${selectedBook.title}</h3>
      <span class="book-info">
        <p class="book-author"> ${selectedBook.author}</p>
        <p class="book-date">Date de publication : ${selectedBook.publicationDate}</p>
      </span>
      <span class="solid-stars" aria-label="Évaluation du livre : ${selectedBook.rating} étoiles">
        ${generateStars(selectedBook.rating)}
      </span>
    `;

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
        `;
        }
    } else {
        bookDetailsContainer.innerHTML = "<p>Livre non trouvé.</p>";
    }
}

function renderAuthorDetailsPage(data) {
    const authorContainer = document.getElementById("author-details");
    const aboutContainer = document.querySelector(".about-container");
    if (!authorContainer) return;

    const id = Number(getUrlParameter("id"));
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

function setupGlobalListeners() {
    // Back button
    const backButton = document.querySelector('.back-button');
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.history.back();
        });
    }

    // Bookmarks toggle
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('bookmark')) {
            e.preventDefault(); // Prevent navigation if inside a link
            e.target.textContent = e.target.textContent.trim() === '★' ? '☆' : '★';
        }
    });
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
