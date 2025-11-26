# Tuto & Bilan du Projet Bibliomaniac

Ce document résume comment lancer le projet et liste les améliorations possibles suite à un audit rapide.

## 1. Comment lancer le projet

Le projet ne disposant pas de système de build (comme Webpack ou Vite) ni de `package.json`, il s'agit d'un site statique. Cependant, comme il utilise `fetch` pour charger des données JSON (`datas/datas.json`), il **doit** être servi via un serveur HTTP pour éviter les erreurs CORS (Cross-Origin Resource Sharing) qui bloquent les requêtes `fetch` sur le protocole `file://`.

### Méthode recommandée (Python)
Si vous avez Python installé (macOS/Linux l'ont souvent par défaut) :

1.  Ouvrez un terminal dans le dossier du projet.
2.  Lancez la commande suivante :
    ```bash
    python3 -m http.server 8080
    ```
3.  Ouvrez votre navigateur à l'adresse : [http://localhost:8080/index.html](http://localhost:8080/index.html)

### Alternative (Extension VS Code)
Si vous utilisez VS Code, vous pouvez installer l'extension **"Live Server"** :
1.  Faites un clic droit sur `index.html`.
2.  Choisissez "Open with Live Server".

---

## 2. Bilan de l'audit

Le projet est fonctionnel dans l'ensemble : la page d'accueil charge les livres, la navigation vers les détails fonctionne, et la page "Mes livres" affiche la liste. Cependant, plusieurs erreurs techniques et problèmes d'expérience utilisateur ont été relevés.

### Points positifs
-   L'architecture simple (HTML/CSS/JS) est facile à comprendre.
-   Le chargement dynamique des données via JSON fonctionne.

### Problèmes identifiés
-   **Erreurs Console** :
    -   `GET /favicon.ico 404 (Not Found)` : L'icône du site est manquante.
    -   `erreur !!` (fetchDatas.js) : Apparaît sur les pages `index.html` et `mes-livres.html` car le script cherche un ID dans l'URL alors qu'il n'y en a pas nécessairement besoin sur ces pages.
    -   `Livre non trouvé` (fetchDatas.js) : Apparaît même quand le livre est correctement affiché sur la page de détails.
-   **Code Mort / Inutilisé** :
    -   Dans `app.js`, la fonction `generateBookCards` est définie mais appelée avec des variables inexistantes (`featuredBooks`, `newReleases`), ce qui pourrait provoquer des erreurs si ce code s'exécutait.
-   **Navigation** :
    -   Sur la page `mes-livres.html`, la barre de navigation du bas indique que l'on est sur la page "Messages" (icône active incorrecte).
    -   Les boutons "Retour" et certains liens de navigation affichent simplement une alerte "Non implémenté".

---

## 3. Améliorations recommandées

Voici une liste d'actions concrètes pour améliorer le projet, classées par priorité.

### Priorité Haute (Fixes)

1.  **Corriger la logique de `fetchDatas.js`** :
    -   Empêcher le log "erreur !!" si l'URL ne contient pas d'ID mais que l'on est sur l'index ou "mes livres".
    -   Corriger la condition dans la page de détails pour ne pas logger "Livre non trouvé" si le livre a été trouvé.
    -   *Exemple de fix* : Utiliser des `else if` stricts et ne logger "erreur" que si aucune page connue n'est détectée.

2.  **Réparer la navigation active** :
    -   Sur `mes-livres.html`, s'assurer que la classe `active` est bien sur l'icône "Mes livres" et non sur "Messages". Cela peut être corrigé directement dans le HTML de `mes-livres.html` ou via JS.

3.  **Ajouter un Favicon** :
    -   Ajouter un fichier `favicon.ico` à la racine pour supprimer l'erreur 404.

### Priorité Moyenne (Nettoyage de code)

4.  **Nettoyer `app.js`** :
    -   Supprimer ou commenter les appels à `generateBookCards` (lignes 71-72) qui utilisent des variables non définies.
    -   Supprimer les `console.log` de débogage laissés dans `fetchDatas.js`.

### Priorité Basse (Fonctionnalités & UX)

5.  **Implémenter le bouton Retour** :
    -   Remplacer l'alerte par `history.back()` pour un vrai retour en arrière.
    ```javascript
    document.querySelector('.back-button').addEventListener('click', () => {
        window.history.back();
    });
    ```

6.  **Améliorer l'accessibilité** :
    -   Ajouter des attributs `alt` pertinents sur toutes les images générées dynamiquement (c'est déjà partiellement fait, à vérifier).
    -   Utiliser des balises sémantiques (`<article>`, `<nav>`, etc.) si ce n'est pas déjà le cas partout.
