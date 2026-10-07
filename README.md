# onlyPoele

onlyPoele est une démonstration de boutique de poêles à frire. Ce projet a été **instancié avec Prométhée** et a servi de démo lors d'une formation consacrée à la création d'un site grâce à l'IA.

La formation illustre le passage d'un brief à une interface React : choix d'une référence visuelle, intégration de composants, animation Three.js, corrections à partir de captures et vérification du résultat.

## Démonstration actuelle

- Page de présentation responsive, inspirée de [Partake Foods](https://www.awwwards.com/sites/partake-foods).
- Galerie accordéon issue de React Bits, animée avec GSAP.
- Animation Three.js fournie pour le projet : huit poêles s'empilent une seule fois à l'apparition de la section, puis restent immobiles. Une vue fixe prend le relais si les mouvements sont réduits ou si WebGL est indisponible.
- Panier local : ajout, quantités, suppression et total sont implémentés ; la conservation utilise le navigateur lorsque son stockage est disponible.

Les produits et leurs prix restent à fournir : **le catalogue publié est vide**, le panier ne peut donc pas encore être rempli depuis la démo. Des produits réservés aux tests permettent de vérifier ce parcours. Les photographies sont des visuels d'ambiance générés, avec leur provenance dans [docs/design/asset-prompts.json](docs/design/asset-prompts.json).

Cette version ne passe aucune commande et n'effectue aucun paiement. Elle fonctionne sans API, base de données, compte client ni variable d'environnement. Le squelette backend présent dans l'espace de travail local est ignoré par Git et ne fait pas partie de la publication.

## Démarrer en local

Prérequis : Node.js **24.x**, npm **11.x** et Git. Prométhée a préparé le projet ; son installation n'est pas nécessaire pour lancer cette démo depuis un clone.

```sh
git clone https://github.com/ThomRul/onlypoele.git
cd onlypoele/frontend
npm ci
npm run dev
```

Vite affiche l'adresse locale dans le terminal. Sous PowerShell, utiliser `npm.cmd` si l'exécution de `npm.ps1` est bloquée.

## Vérifier et construire

Depuis `frontend` :

```sh
npm run typecheck
npm run lint
npm run test
npm run build
npm run preview
```

Le build produit un site statique dans `frontend/dist`. Les tests couvrent notamment le panier, la galerie et la lecture unique de la scène 3D ; le rendu WebGL doit aussi être contrôlé dans un navigateur.

## Déployer sur Vercel depuis GitHub

1. Sur Vercel, choisir **Add New → Project**, connecter GitHub et importer **ThomRul/onlypoele**.
2. Régler **Root Directory** sur **`frontend`** et **Framework Preset** sur **Vite**.
3. Utiliser les réglages ci-dessous, sans ajouter de variable d'environnement.
4. Choisir **Deploy**, puis partager l'URL attribuée par Vercel.

| Réglage | Valeur |
| --- | --- |
| Branche de production | `main` |
| Root Directory | `frontend` |
| Node.js | `24.x` |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

[frontend/vercel.json](frontend/vercel.json) fixe les commandes de build et la réécriture vers `index.html`. La racine `frontend` doit être choisie lors de l'import ; elle n'est pas définie par ce fichier. Les détails figurent dans les documentations Vercel sur [Vite](https://vercel.com/docs/frameworks/frontend/vite) et [la configuration du build](https://vercel.com/docs/builds/configure-a-build). Node 24 est [pris en charge par Vercel](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).

Après l'import, les nouveaux commits poussés sur la branche de production déclenchent un déploiement via [l'intégration Git de Vercel](https://vercel.com/docs/git).

```sh
git add <fichiers-modifiés>
git commit -m "feat(frontend): décrire la modification"
git push origin main
```

## Stack et repères

React, TypeScript, Vite, Tailwind CSS, Motion, GSAP et Three.js. Les icônes Phosphor et les polices Archivo Black / Barlow Condensed sont distribuées localement avec le frontend.

- `frontend/src/features/storefront/` : présentation et scène 3D.
- `frontend/src/components/AccordionGallery.tsx` : galerie.
- `frontend/src/features/catalog/products.ts` : futurs produits.
- `frontend/src/features/cart/` : panier local.
- `PROJECT.md` : décisions et périmètre actuel.
