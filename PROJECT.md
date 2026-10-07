# onlyPoele

Boutique de poêles à frire. Profil : Web React et API. L'étape actuelle concerne uniquement le frontend.

## Objectif et utilisateurs

Permettre aux visiteurs de consulter les poêles et de constituer un panier.

## Périmètre MVP et priorités

- Présentation de la boutique et galerie de produits.
- Catalogue, ajout au panier, modification des quantités, suppression et total.
- Panier conservé localement dans le navigateur lorsque le stockage est disponible.
- Les produits, prix et visuels seront fournis par l'utilisateur. Aucun produit fictif n'est publié : la galerie utilise des illustrations de présentation identifiées et le catalogue reste vide en attendant les données.
- API métier, intégration PostgreSQL et paiement hors de l'étape frontend actuelle.

## Interface et contenus

- Référence choisie : [Partake Foods sur Awwwards](https://www.awwwards.com/sites/partake-foods), complétée par [le site Partake Foods](https://partakefoods.com/).
- Direction : fond crème, bleu profond, orange, jaune et lilas ; titres arrondis et expressifs ; compositions centrées sur les poêles et boutons aux contours marqués.
- Galerie : `AccordionGallery` de React Bits, source fournie par l'utilisateur, adaptée à TypeScript, au clavier, au tactile et à la réduction des mouvements. GSAP autorisé explicitement pour ce composant.
- Animations : scène de poêle Three.js dans un composant React, chargée séparément, avec pause, suspension hors écran et lorsque l'onglet est masqué. Illustration SVG de secours et affichage statique lorsque les mouvements sont réduits. Motion sert les entrées de texte et les transitions des interactions.
- Contenu en français ; nom affiché exactement `onlyPoele`. Illustrations originales en SVG en attendant les photos des produits.

## Contraintes et décisions actuelles

- Socle technique : React / TypeScript / Vite, NestJS / TypeORM / PostgreSQL, Tailwind / shadcn
- Options sélectionnées : database=postgresql, uiAnimations=true, editorialAnimations=false
- Docker : sans Docker. PostgreSQL local sera géré par Prométhée lors de l'étape backend ; association et connexion restent à préparer.
- Hébergement ou distribution : à préciser si cela influence les choix.

## Questions ouvertes

- Informations des produits : noms, prix et devise, caractéristiques, descriptions et visuels.
- Hébergement et périmètre d'une éventuelle commande à définir lors des étapes concernées.
