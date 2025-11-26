/**
 * Book Reader JavaScript
 * Handles book reading with page-turning effect
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
    const book = data.books.find(b => b.id === parseInt(bookId));

    if (!book) {
        alert('Livre non trouvé');
        window.location.href = 'index.html';
        return;
    }

    // Update title
    document.getElementById('book-title-reader').textContent = book.title;

    // Split content into pages (simulate book content)
    const content = generateBookContent(book);
    window.bookPages = splitIntoPages(content);
    window.currentPage = 0;

    renderPages();
}

function generateBookContent(book) {
    // Generate sample content based on book description
    // In a real app, you would fetch the actual book content from Google Books API
    const chapters = [
        {
            title: `Chapitre 1: Introduction`,
            content: book.description || 'Contenu du livre non disponible.'
        },
        {
            title: `Chapitre 2: Développement`,
            content: `Ce livre écrit par ${book.author} explore des thèmes fascinants. ${book.description || ''}`
        },
        {
            title: `À propos de l'auteur`,
            content: book.aboutAuthor || 'Informations sur l\'auteur non disponibles.'
        }
    ];

    return chapters;
}

function splitIntoPages(chapters) {
    // Each chapter becomes a page pair (left and right)
    const pages = [];
    chapters.forEach((chapter, index) => {
        pages.push({
            left: {
                title: chapter.title,
                content: chapter.content.substring(0, Math.floor(chapter.content.length / 2))
            },
            right: {
                title: '',
                content: chapter.content.substring(Math.floor(chapter.content.length / 2))
            }
        });
    });
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
        <p>${currentPageData.left.content}</p>
    `;

    // Render right page
    pageRightContent.innerHTML = `
        ${currentPageData.right.title ? `<h2>${currentPageData.right.title}</h2>` : ''}
        <p>${currentPageData.right.content}</p>
    `;

    // Update page info
    pageInfo.textContent = `Page ${window.currentPage + 1} / ${window.bookPages.length}`;

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
        }, 300);
    }
}

function prevPage() {
    if (window.currentPage > 0) {
        // Add turning animation
        const pageLeft = document.querySelector('.page-left');
        pageLeft.classList.add('turning');

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
    const pageContents = document.querySelectorAll('.page-content');

    fontSizeSlider.addEventListener('input', (e) => {
        const size = e.target.value;
        fontSizeLabel.textContent = `${size}px`;
        pageContents.forEach(content => {
            content.style.fontSize = `${size}px`;
        });
    });

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
