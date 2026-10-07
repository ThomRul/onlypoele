# Interface React

Responsabilité : boutique onlyPoele, présentation des poêles, galerie animée et panier local. L'étape actuelle couvre le frontend.

## Entrées et fichiers utiles

- `frontend/src/App.tsx`
- `frontend/src/features/storefront/Hero.tsx` : hero photographique pleine largeur et entrée Motion.
- `frontend/src/features/storefront/StoreHeader.tsx` : logo centré, navigation et panier ; en-tête transparent puis crème selon le défilement.
- `frontend/src/features/storefront/CookingStage.tsx` et `PanScene.tsx` : présentation 3D et chargement de Three.js à l'approche du viewport.
- `frontend/src/features/storefront/createPanScene.ts` : géométrie de présentation, boucle de rendu, visibilité, pause et libération des ressources GPU.
- `frontend/src/components/AccordionGallery.tsx` et son CSS : galerie React Bits fournie par l'utilisateur, GSAP, navigation clavier et affichage mobile.
- `frontend/src/features/catalog/products.ts` : type Product, catalogue actuellement vide et formatage monétaire.
- `frontend/src/features/catalog/Catalog.tsx` : produits ou état vide.
- `frontend/src/features/cart/useCart.ts` et `CartDialog.tsx` : quantités, persistance locale et dialogue natif.
- `frontend/public/media/` : visuels d'ambiance photographiques générés, explicitement identifiés, sans références produit fictives. Prompts dans `docs/design/asset-prompts.json`.
- `frontend/public/illustrations/hero-pan.svg` : secours statique de la scène 3D.
- `frontend/src/main.tsx`
- `frontend/src/styles.css`
- `frontend/src/lib/utils.ts`
- `frontend/components.json`
- `frontend/vite.config.ts`

## Dépendances et frontières

Le parcours actuel utilise un catalogue local et localStorage ; aucun appel API. Le proxy `/api` reste disponible pour l'étape backend. Les secrets et règles d’autorisation restent côté serveur. Les prix ne sont jamais relus depuis le stockage du panier.

## Éléments réutilisables

Tokens CSS, styles partagés de boutons, `Icon`, `useMediaQuery` et `cn()`. Polices libres Archivo Black et Barlow Condensed hébergées localement avec Fontsource. Les CSS de fonctionnalités sont limités à `.storefront` ; ceux de la galerie à `.accordion-gallery`.

Mouvement réduit : photographie du hero immobile, illustration SVG à la place de la scène 3D et transitions immédiates de la galerie. Three.js est chargé dans un chunk distinct, suspendu hors écran et dans un onglet masqué, et peut être mis en pause. Le dialogue natif assure la modalité dans les navigateurs compatibles.

## Vérifications

- typecheck
- lint
- build
- test comportement utile

Les tests jsdom couvrent le panier, sa persistance et les entrées corrompues, la navigation de galerie, l'état vide et la réduction des mouvements. Avec un renderer simulé, ils vérifient aussi pause, visibilité et nettoyage de Three.js. Ils ne vérifient pas le rendu WebGL, le confinement natif du focus ou l'apparence dans un navigateur.

Mettre à jour cette carte lorsque ces informations changent. Ne pas y recopier le contenu des fichiers ou le catalogue complet des composants.
