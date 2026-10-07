# onlyPoele

Boutique de poêles à frire. Profil : Web React et API. L'étape actuelle concerne uniquement le frontend.

## Objectif et utilisateurs

Permettre aux visiteurs de consulter les poêles et de constituer un panier.

## Périmètre MVP et priorités

- Présentation de la boutique et galerie de produits.
- Catalogue, ajout au panier, modification des quantités, suppression et total.
- Panier conservé localement dans le navigateur lorsque le stockage est disponible.
- Les produits, prix et visuels seront fournis par l'utilisateur. Aucun produit fictif n'est publié : hero et galerie utilisent des visuels d'ambiance générés dont la provenance est documentée dans le projet ; le catalogue reste vide en attendant les données. La mention de génération n'est pas affichée dans l'interface.
- API métier, intégration PostgreSQL et paiement hors de l'étape frontend actuelle.

## Interface et contenus

- Référence choisie : [Partake Foods sur Awwwards](https://www.awwwards.com/sites/partake-foods), complétée par [le site Partake Foods](https://partakefoods.com/).
- Direction fondée sur les captures et styles publics de Partake : crème `#fff6eb`, bleu `#00559b`, magenta `#be008b`, orange `#ff7700`, jaune et lilas. Hero photographique pleine largeur, grand titre bleu avec ombre cyan, logo centré et boutons rectangulaires arrondis, étiquettes inclinées avec ombres franches. Archivo Black pour les titres, Barlow Condensed pour les boutons et étiquettes ; polices libres hébergées localement. Les sections crème, bleue et magenta rythment la page.
- Galerie : `AccordionGallery` de React Bits, source fournie par l'utilisateur, adaptée à TypeScript, au clavier, au tactile et à la réduction des mouvements. GSAP autorisé explicitement pour ce composant.
- Icônes : Phosphor Icons pour React, sous licence MIT, avec imports individuels. Motifs culinaires pour les éléments décoratifs ; variantes grasses pour les commandes.
- Animations : scène de poêle Three.js dans `CookingStage`, chargée lorsque son emplacement approche de l'écran, avec pause, suspension hors écran et lorsque l'onglet est masqué. Illustration SVG de secours et affichage statique lorsque les mouvements sont réduits. Motion sert l'entrée du hero, des étiquettes et les transitions des interactions. Le bandeau éditorial reste statique.
- Contenu en français ; nom affiché exactement `onlyPoele`. Les images de Partake servent uniquement de référence et ne sont pas utilisées sur le site. Les quatre visuels d'ambiance originaux sont dans `frontend/public/media/` ; les prompts et leur mode de génération sont dans [asset-prompts.json](docs/design/asset-prompts.json).

## Contraintes et décisions actuelles

- Socle technique : React / TypeScript / Vite, NestJS / TypeORM / PostgreSQL, Tailwind / shadcn
- Options sélectionnées : database=postgresql, uiAnimations=true, editorialAnimations=false
- Docker : sans Docker. PostgreSQL local sera géré par Prométhée lors de l'étape backend ; association et connexion restent à préparer.
- Hébergement ou distribution : à préciser si cela influence les choix.

## Questions ouvertes

- Informations des produits : noms, prix et devise, caractéristiques, descriptions et visuels.
- Hébergement et périmètre d'une éventuelle commande à définir lors des étapes concernées.
