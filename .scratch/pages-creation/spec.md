# Création de Pages dans un Workspace

**Status:** ready-for-agent

## Problem Statement

Je suis connecté à Vision mais la sidebar n'est qu'une maquette : je n'ai aucun Workspace réel, je ne peux créer aucune Page, et rien n'est conservé. Je veux pouvoir ouvrir l'application, arriver dans mon Workspace et y créer des Pages que je retrouve ensuite.

## Solution

À ma première visite authentifiée, un Workspace par défaut est créé pour moi, nommé d'après mon prénom. J'arrive dessus, son nom s'affiche en haut de la sidebar, et je peux y créer des Pages à la racine en un clic. Chaque Page apparaît dans la liste de la sidebar et s'ouvre sur sa propre adresse. L'onglet des Workspaces permet de les lister et d'en changer. Mes Workspaces et mes Pages me sont strictement personnels.

## User Stories

1. En tant qu'utilisateur connecté, je veux qu'un Workspace soit créé automatiquement à ma première visite, afin de pouvoir travailler sans configuration préalable.
2. En tant qu'utilisateur, je veux que mon Workspace par défaut porte mon prénom (« Thibaut's workspace »), afin de le reconnaître immédiatement.
3. En tant qu'utilisateur dont le prénom est absent ou vide, je veux que mon Workspace s'appelle « Workspace 1 », afin d'avoir un nom lisible malgré tout.
4. En tant qu'utilisateur, je veux que le nom du Workspace ne change pas quand je modifie mon profil, afin qu'il ne soit pas renommé sans mon accord.
5. En tant qu'utilisateur, je veux que revenir sur l'application ne crée pas un deuxième Workspace par défaut, afin de ne pas accumuler de doublons.
6. En tant qu'utilisateur, je veux que `/` m'amène directement sur mon Workspace par défaut, afin de ne pas passer par une page vide.
7. En tant qu'utilisateur, je veux que l'adresse de mon Workspace courant soit dans l'URL, afin de pouvoir la mettre en favori ou la recharger.
8. En tant qu'utilisateur, je veux voir le nom du Workspace courant en haut de la sidebar, afin de savoir où je me trouve.
9. En tant qu'utilisateur, je veux créer une Page en un clic sur « Create page », afin de ne pas être interrompu par un formulaire.
10. En tant qu'utilisateur, je veux que la nouvelle Page s'appelle « Untitled », afin qu'elle ait un titre dès sa création.
11. En tant qu'utilisateur, je veux être amené sur la Page que je viens de créer, afin de la voir tout de suite.
12. En tant qu'utilisateur, je veux voir le titre de la Page sur son adresse, afin de confirmer que c'est la bonne.
13. En tant qu'utilisateur, je veux que mes Pages apparaissent dans la sidebar, afin de les retrouver et d'y naviguer.
14. En tant qu'utilisateur, je veux que les Pages soient listées de la plus ancienne à la plus récente, afin que l'ordre soit stable et que les nouvelles arrivent près du bouton de création.
15. En tant qu'utilisateur, je veux voir le nombre de Pages sur l'onglet Pages, afin de mesurer le contenu du Workspace.
16. En tant qu'utilisateur d'un Workspace vide, je veux un message clair, afin de comprendre comment démarrer.
17. En tant qu'utilisateur, je veux filtrer les Pages par leur titre, afin de retrouver rapidement une Page.
18. En tant qu'utilisateur, je veux retrouver mes Pages après un rechargement ou une reconnexion, afin de ne rien perdre.
19. En tant qu'utilisateur, je veux voir la liste de mes Workspaces dans l'onglet « Workspaces », afin de savoir lesquels j'ai.
20. En tant qu'utilisateur, je veux cliquer sur un Workspace pour y aller, afin d'en changer.
21. En tant qu'utilisateur, je veux voir le Workspace courant mis en évidence dans la liste, afin de ne pas me tromper.
22. En tant qu'utilisateur, je veux filtrer mes Workspaces par leur nom, afin d'en trouver un facilement quand j'en aurai plusieurs.
23. En tant qu'utilisateur, je veux une 404 si j'ouvre l'adresse d'un Workspace qui n'est pas à moi ou qui n'existe pas, afin que personne ne puisse deviner quels Workspaces existent.
24. En tant qu'utilisateur, je veux une 404 si j'ouvre une Page qui n'appartient pas au Workspace de l'adresse, afin d'éviter les accès croisés.
25. En tant qu'utilisateur, je veux qu'on ne puisse jamais créer de Page dans le Workspace de quelqu'un d'autre, afin que mes données et les siennes restent séparées.
26. En tant qu'utilisateur non connecté, je veux être renvoyé vers la connexion, afin qu'aucune donnée ne soit exposée.
27. En tant que développeur, je veux que le modèle permette un parent optionnel pour une Page, afin d'ajouter les Sous-pages plus tard sans migration lourde.
28. En tant que développeur, je veux que le modèle permette plusieurs Workspaces par utilisateur, afin d'ajouter la création, le renommage et la suppression plus tard sans refonte.

## Implementation Decisions

- **Vocabulaire :** le terme est **Workspace**, jamais « Space ». L'onglet « Spaces » de la maquette devient « Workspaces ». Le glossaire est déjà à jour dans `CONTEXT.md`.
- **Workspace :**
  - Un utilisateur a N Workspaces, tous renommables.
  - La règle future est « on ne supprime un Workspace que s'il en reste un autre ». Il n'y a pas de drapeau « par défaut » dans le modèle.
  - Création, renommage et suppression de Workspace ne sont pas implémentés ici.
- **Workspace par défaut :**
  - Il est créé paresseusement : à la première visite authentifiée, si l'utilisateur n'a aucun Workspace.
  - La création doit être idempotente, y compris sous deux requêtes concurrentes, sans doublon.
  - Le nom est « <Prénom>'s workspace », ou « Workspace 1 » si le prénom est absent ou vide.
  - Le nom est copié à la création et ne suit pas Clerk ensuite.
  - Le prénom vient du profil Clerk.
- **Workspace courant :** il est porté par l'URL, sous la forme `/[workspaceId]`. La racine `/` redirige vers un Workspace de l'utilisateur, le premier créé. Son nom s'affiche en haut de la sidebar, à la place de « Nimbus ».
- **Page :**
  - Une Page appartient à un Workspace et porte un titre. Elle a un parent optionnel, toujours vide dans cette tâche.
  - « Create page » la crée immédiatement avec le titre « Untitled », sans formulaire, puis navigue vers `/[workspaceId]/[pageId]`.
  - Cette route affiche le titre en lecture seule.
  - Les Pages d'un Workspace sont listées de la plus ancienne à la plus récente.
- **Contrôle d'accès :**
  - L'appartenance est vérifiée côté serveur à chaque lecture et écriture, avec l'identifiant utilisateur de Clerk.
  - Un Workspace inexistant ou appartenant à un autre renvoie une 404, sans distinction.
  - Une Page qui n'appartient pas au Workspace de l'adresse renvoie aussi une 404.
- **Module central :**
  - Il expose des opérations côté serveur : obtenir ou créer le Workspace par défaut d'un utilisateur, lister ses Workspaces, créer une Page à la racine d'un Workspace, lire une Page, lister les Pages d'un Workspace.
  - Toutes prennent l'identifiant utilisateur en entrée et répondent « introuvable » en cas d'accès non autorisé.
  - Les routes et la sidebar restent de fins adaptateurs au-dessus de ce module.
- **Sidebar :**
  - Les onglets « Workspaces » (liste, compteur, filtre, Workspace courant mis en évidence, clic pour naviguer) et « Pages » (liste, compteur, filtre, état vide, « Create page ») deviennent réels.
  - Le bouton « Create workspace » est masqué ou inactif.
- **Persistance :** le choix du stockage est **volontairement ouvert** et sera tranché dans une session de grilling dédiée (probablement avec un ADR). Cette spec ne le préjuge pas. Elle exige seulement que Workspaces et Pages survivent à un redémarrage de l'application.

## Testing Decisions

- **Ce qu'est un bon test :** il vérifie un comportement observable depuis l'extérieur du module (ce qui est renvoyé, ce qui est refusé), jamais les détails d'implémentation ni les appels internes. Pas de mock du stockage : on utilise une vraie base de test.
- **Seam unique :** l'interface du module Workspaces/Pages décrit ci-dessus. Les composants de la sidebar et les routes ne sont pas testés directement.
- **Cas à couvrir :**
  - Le Workspace par défaut est créé une fois et seulement une fois, y compris sur deux appels successifs ou concurrents.
  - Le nom vaut « Thibaut's workspace » pour un prénom renseigné, et « Workspace 1 » pour un prénom vide ou absent.
  - Une Page créée est à la racine, nommée « Untitled », et rattachée au bon Workspace.
  - Les Pages sont listées de la plus ancienne à la plus récente.
  - Un utilisateur ne peut ni lire, ni lister, ni créer dans le Workspace d'un autre, et obtient « introuvable ».
  - Une Page demandée avec le mauvais Workspace est « introuvable ».
- **Calendrier :** conformément à `AGENTS.md`, pas de TDD. Les tests sont écrits après l'implémentation, une fois le comportement stable.
- **Prior art :** il n'y a aucun test dans le dépôt. Seule la configuration vitest existe (environnement `node`).

## Out of Scope

- Création, renommage et suppression de Workspace (le modèle les prévoit, l'interface non).
- Sous-pages et arbre dépliable.
- Éditeur de contenu (BlockNote) et Blocks.
- Renommage et suppression de Page.
- Déplacement de Pages et drag & drop.
- Collaboration, partage de Workspace entre utilisateurs, corbeille, recherche globale (voir `docs/backlog.md`).
- Choix de la technologie de persistance (session dédiée).
- Déploiement public.

## Further Notes

- `AGENTS.md` prévient que cette version de Next.js a des changements incompatibles : lire `node_modules/next/dist/docs/` avant d'écrire du code.
- L'authentification Clerk est déjà en place. Le backlog classe encore « authentification » hors v1 : il est obsolète sur ce point.
- Le dossier `.scratch/` et les fichiers `docs/agents/` sont supprimés du working tree (présents dans git). La spec et les tickets de cette tâche vivent dans `.scratch/pages-creation/`.
- L'interface est aujourd'hui en anglais (« Create page », « No pages found ») : on garde l'anglais pour les libellés.
