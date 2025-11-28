// Script temporaire pour afficher les IDs des livres
// Ouvrez la console du navigateur et exécutez ce code

async function showBookIds() {
    const cachedData = localStorage.getItem('bibliomaniac_books');
    if (cachedData) {
        const data = JSON.parse(cachedData);
        console.log('=== Liste des livres avec leurs IDs ===');
        data.books.forEach((book, index) => {
            console.log(`${index + 1}. "${book.title}" par ${book.author}`);
            console.log(`   ID: ${book.id}`);
            console.log(`   Image: ${book.image}`);
            console.log('---');
        });
    } else {
        console.log('Aucune donnée en cache. Rechargez la page d\'accueil d\'abord.');
    }
}

showBookIds();
