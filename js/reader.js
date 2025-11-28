/**
 * Book Reader JavaScript
 * Handles book reading with page-turning effect using API data
 */

function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

async function loadBook() {
    const bookId = getUrlParameter('id');
    if (!bookId) {
        alert('Aucun livre spécifié');
        window.location.href = 'index.html';
        return;
    }

    // Get book data from localStorage
    const cachedData = localStorage.getItem('bibliomaniac_books');
    if (!cachedData) {
        alert('Données du livre non trouvées');
        window.location.href = 'index.html';
        return;
    }

    const data = JSON.parse(cachedData);
    const book = data.books.find(b => b.id === bookId);

    if (!book) {
        alert('Livre non trouvé');
        window.location.href = 'index.html';
        return;
    }

    // Update title
    document.getElementById('book-title-reader').textContent = book.title;

    // Generate content pages from API data
    const content = generateBookContent(book);
    window.bookPages = splitIntoPages(content);
    window.currentPage = 0;

    renderPages();
}

function generateBookContent(book) {
    // Since the public API doesn't provide full text, we simulate the experience
    // using the available metadata to create a "preview" feel.

    const chapters = [];

    // Cover / Title Page
    chapters.push({
        title: book.title,
        content: `
            <div style="text-align: center; margin-top: 2rem;">
                <img src="${book.image}" alt="${book.title}" style="max-width: 150px; border-radius: 5px; box-shadow: 0 5px 15px rgba(0,0,0,0.2);">
                <h2 style="margin-top: 2rem;">${book.title}</h2>
                <p style="font-size: 1.2rem; color: #555;">${book.author}</p>
                <p style="margin-top: 3rem; font-size: 0.9rem; color: #888;">Publié par Bibliomaniac</p>
            </div>
        `
    });

    // Description / Synopsis
    if (book.description) {
        chapters.push({
            title: "Synopsis",
            content: `<p>${book.description}</p>`
        });
    }

    // Author Info
    if (book.aboutAuthor) {
        chapters.push({
            title: "À propos de l'auteur",
            content: `<p>${book.aboutAuthor}</p>`
        });
    }

    // Sample Chapter (Lorem Ipsum or repeated description to simulate length)
    chapters.push({
        title: "Chapitre 1",
        content: `
            <p>Il était une fois, dans un monde rempli de livres...</p>
            <p>${book.description}</p>
            <p>La lecture est une fenêtre ouverte sur le monde. Elle permet de voyager sans bouger, de vivre mille vies en une seule. Chaque page tournée est une nouvelle aventure qui commence.</p>
            <p>Les mots s'enchaînent pour former des phrases, les phrases des paragraphes, et les paragraphes des histoires qui nous touchent, nous émeuvent, nous transforment.</p>
        `
    });

    // Call to Action / Real Link
    chapters.push({
        title: "Fin de l'aperçu",
        content: `
            <div style="text-align: center; margin-top: 3rem;">
                <p>Vous avez atteint la fin de cet aperçu généré.</p>
                <p>Pour lire le livre complet, veuillez consulter la version officielle.</p>
                ${book.previewLink ? `<a href="${book.previewLink}" target="_blank" style="display: inline-block; margin-top: 1rem; padding: 0.8rem 1.5rem; background: var(--color-accent); color: white; text-decoration: none; border-radius: 2rem; font-weight: bold;">Lire sur Google Books</a>` : ''}
            </div>
        `
    });

    return chapters;
}

function splitIntoPages(chapters) {
    // Each "chapter" here is treated as a section. 
    // We want to map these sections to left/right page pairs.
    // This is a simplified pagination.
    const pages = [];

    // We can put one chapter per page side, or split long chapters.
    // For simplicity, let's put one chapter content per page side.

    for (let i = 0; i < chapters.length; i += 2) {
        pages.push({
            left: chapters[i] || { title: '', content: '' },
            right: chapters[i + 1] || { title: '', content: '' }
        });
    }

    return pages;
}

function renderPages() {
    const pageLeftContent = document.getElementById('page-left-content');
    const pageRightContent = document.getElementById('page-right-content');
    const pageInfo = document.getElementById('page-info');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');

    if (!window.bookPages || window.bookPages.length === 0) {
        pageLeftContent.innerHTML = '<p>Aucun contenu disponible</p>';
        pageRightContent.innerHTML = '<p>Aucun contenu disponible</p>';
        return;
    }

    const currentPageData = window.bookPages[window.currentPage];

    // Render left page
    pageLeftContent.innerHTML = `
        ${currentPageData.left.title ? `<h2>${currentPageData.left.title}</h2>` : ''}
        <div class="page-text">${currentPageData.left.content}</div>
    `;

    // Render right page
    pageRightContent.innerHTML = `
        ${currentPageData.right.title ? `<h2>${currentPageData.right.title}</h2>` : ''}
        <div class="page-text">${currentPageData.right.content}</div>
    `;

    // Update page info
    pageInfo.textContent = `Pages ${window.currentPage * 2 + 1}-${(window.currentPage * 2) + 2} / ${window.bookPages.length * 2}`;

    // Update button states
    prevBtn.disabled = window.currentPage === 0;
    nextBtn.disabled = window.currentPage === window.bookPages.length - 1;
}

function nextPage() {
    if (window.currentPage < window.bookPages.length - 1) {
        // Add turning animation
        const pageRight = document.querySelector('.page-right');
        pageRight.classList.add('turning');

        setTimeout(() => {
            window.currentPage++;
            renderPages();
            pageRight.classList.remove('turning');
        }, 300); // Match CSS transition duration
    }
}

function prevPage() {
    if (window.currentPage > 0) {
        // Add turning animation
        const pageLeft = document.querySelector('.page-left');
        pageLeft.classList.add('turning'); // We might need a different class for reverse turn visual

        setTimeout(() => {
            window.currentPage--;
            renderPages();
            pageLeft.classList.remove('turning');
        }, 300);
    }
}

function setupEventListeners() {
    // Close reader
    document.querySelector('.close-reader').addEventListener('click', () => {
        window.history.back();
    });

    // Page navigation
    document.getElementById('prev-page').addEventListener('click', prevPage);
    document.getElementById('next-page').addEventListener('click', nextPage);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') prevPage();
        if (e.key === 'ArrowRight') nextPage();
    });

    // Font size control
    const fontSizeSlider = document.getElementById('font-size-slider');
    const fontSizeLabel = document.getElementById('font-size-label');

    if (fontSizeSlider && fontSizeLabel) {
        fontSizeSlider.style.display = 'inline-block';
        fontSizeLabel.style.display = 'inline';

        fontSizeSlider.addEventListener('input', (e) => {
            const size = e.target.value;
            fontSizeLabel.textContent = `${size}px`;
            document.querySelectorAll('.page-content').forEach(content => {
                content.style.fontSize = `${size}px`;
            });
        });
    }

    // Fullscreen
    document.getElementById('fullscreen-btn').addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadBook();
    setupEventListeners();
});
