# Interface React

Responsabilité : boutique onlyPoele, présentation des poêles, galerie animée et panier local. L'étape actuelle couvre le frontend.

## Entrées et fichiers utiles

- `frontend/src/App.tsx`
- `frontend/src/features/storefront/Hero.tsx` : hero photographique pleine largeur et entrée Motion.
- `frontend/src/features/storefront/StoreHeader.tsx` : logo centré, navigation et panier ; en-tête transparent puis crème selon le défilement.
- `frontend/src/features/storefront/CookingStage.tsx` et `PanScene.tsx` : présentation 3D et chargement de Three.js à l'approche du viewport.
- `frontend/src/features/storefront/createPanScene.ts` : lecture unique, boucle de rendu, visibilité et libération des ressources GPU. La pose finale reste affichée sans commandes ni indications.
- `frontend/src/features/storefront/pan-animation/` : géométries des huit poêles et des œufs, matériaux et éclairage, trajectoires et confettis repris de la source fournie par l'utilisateur.
- `frontend/src/components/AccordionGallery.tsx` et son CSS : galerie React Bits fournie par l'utilisateur, GSAP, navigation clavier et affichage mobile.
- `frontend/src/features/catalog/products.ts` : type Product, catalogue actuellement vide et formatage monétaire.
- `frontend/src/features/catalog/Catalog.tsx` : produits ou état vide.
- `frontend/src/features/cart/useCart.ts` et `CartDialog.tsx` : quantités, persistance locale et dialogue natif.
- `frontend/public/media/` : visuels d'ambiance photographiques générés, sans références produit fictives ni mention de génération dans l'interface. Provenance et prompts dans `docs/design/asset-prompts.json`.
- `frontend/public/illustrations/pan-stack.png` : capture de la pose finale de la scène 3D, utilisée comme secours statique.
- `frontend/public/phosphor-LICENSE.txt` : notice MIT distribuée avec les icônes.
- `frontend/src/main.tsx` : initialise la position sur le hero à chaque chargement complet, puis monte React. Retire l'ancienne ancre en conservant chemin, paramètres et état de l'historique ; la navigation par ancres fonctionne ensuite dans la page.
- `frontend/src/styles.css`
- `frontend/src/lib/utils.ts`
- `frontend/components.json`
- `frontend/vite.config.ts`
- `frontend/vercel.json` : build Vite statique et réécriture SPA ; racine Vercel à régler sur `frontend`.
- `README.md` : présentation du projet, contexte Prométhée et formation.

## Dépendances et frontières

Le parcours actuel utilise un catalogue local et localStorage ; aucun appel API, proxy ou variable d'environnement requis. Le backend local est ignoré par Git et exclu du déploiement Vercel. Les prix ne sont jamais relus depuis le stockage du panier.

## Éléments réutilisables

Tokens CSS, styles partagés de boutons, `useMediaQuery` et `cn()`. `frontend/src/components/Icon.tsx` adapte les composants Phosphor Icons (MIT), importés individuellement, avec SVG décoratifs masqués aux lecteurs d'écran. Polices libres Archivo Black et Barlow Condensed hébergées localement avec Fontsource. Les CSS de fonctionnalités sont limités à `.storefront` ; ceux de la galerie à `.accordion-gallery`.

Mouvement réduit : photographie du hero immobile, capture de la pile à la place de la scène 3D et transitions immédiates de la galerie. Three.js est chargé dans un chunk distinct, suspendu hors écran et dans un onglet masqué. L'empilement ne se rejoue pas après un retour dans la section ou un changement de préférence de mouvement. Le dialogue natif assure la modalité dans les navigateurs compatibles.

## Vérifications

- typecheck
- lint
- build
- test comportement utile

Les tests jsdom couvrent le panier, sa persistance et les entrées corrompues, la navigation de galerie, l'état vide et la réduction des mouvements. Avec un renderer simulé, ils vérifient aussi l'empilement de zéro à huit poêles, l'arrêt définitif après lecture, la suspension selon la visibilité et le nettoyage de Three.js. Ils ne vérifient pas le rendu WebGL, le confinement natif du focus ou l'apparence dans un navigateur.

Mettre à jour cette carte lorsque ces informations changent. Ne pas y recopier le contenu des fichiers ou le catalogue complet des composants.
