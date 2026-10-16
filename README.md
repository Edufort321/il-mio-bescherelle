# Il mio Bescherelle

Conjugueur italien en PWA : tous les temps, traduction française, prononciation (voix de l'appareil), fonctionne hors ligne.

## Mettre en ligne sur Vercel
1. Crée un dépôt GitHub avec le contenu de ce dossier (index.html à la racine).
2. Sur vercel.com : Add New › Project › importe le dépôt › Framework : « Other » › Deploy. Aucun build nécessaire.
   Ou en ligne de commande, dans ce dossier : `npx vercel --prod`

## Installer sur le téléphone
- Android (Chrome) : ouvre l'adresse Vercel ; Chrome propose « Installer l'application », ou touche le bouton « Installer l'app » dans la page.
- iPhone (Safari) : Partager › « Sur l'écran d'accueil ».

Après la première visite, l'app fonctionne sans Internet.

## Mettre à jour
Modifie les fichiers, puis change `VERSION` dans `sw.js` (ex. `bescherelle-v2`) et redéploie.

## Fichiers
- `index.html` : l'app complète (moteur de conjugaison italien + traduction française intégrés)
- `manifest.webmanifest` : nom, icônes, couleurs de l'app installée
- `sw.js` : cache hors ligne
- `vercel.json` : en-têtes pour le service worker et le manifest
- `icons/` : icônes 192, 512, maskable, Apple, favicon
