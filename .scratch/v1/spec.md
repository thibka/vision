Status: ready-for-agent

# Vision v1 : arbre de Pages avec éditeur de Blocks

## Problem Statement

Je veux un espace de prise de notes à la Notion, en local, pour moi seul : organiser mes notes en pages imbriquées et les rédiger avec un éditeur de blocs. Aujourd'hui, l'app n'est qu'un squelette Next.js avec une ébauche de sidebar : je ne peux ni créer de Page, ni écrire, ni retrouver mes notes.

## Solution

Une application locale où le Workspace contient un arbre de Pages, affiché dans une sidebar. Je crée, renomme et supprime des Pages. Chaque Page s'ouvre dans un éditeur BlockNote, dont le contenu est sauvegardé automatiquement. Tout est persisté en SQLite côté serveur.

## User Stories

1. En tant qu'utilisateur, je veux voir mon Workspace avec l'arbre de mes Pages dans une sidebar, afin de m'orienter dans mes notes.
2. En tant qu'utilisateur, je veux créer une Page à la racine du Workspace, afin de démarrer une nouvelle note.
3. En tant qu'utilisateur, je veux créer une Sous-page sous une Page existante, afin de structurer mes notes.
4. En tant qu'utilisateur, je veux qu'une nouvelle Page apparaisse à la fin de la liste de ses sœurs, afin d'avoir un ordre prévisible.
5. En tant qu'utilisateur, je veux ouvrir une Page en cliquant dans la sidebar, afin de lire et d'éditer son contenu.
6. En tant qu'utilisateur, je veux que la Page ouverte soit mise en évidence dans la sidebar, afin de savoir où je suis.
7. En tant qu'utilisateur, je veux renommer une Page, afin que son titre reflète son contenu.
8. En tant qu'utilisateur, je veux que le titre modifié soit mis à jour dans la sidebar, afin de garder une vue cohérente.
9. En tant qu'utilisateur, je veux déplier et replier les Pages qui ont des Sous-pages, afin de garder la sidebar lisible.
10. En tant qu'utilisateur, je veux éditer le contenu d'une Page avec BlockNote (texte, titres, listes, to-do, code, menu « / »), afin de rédiger sans friction.
11. En tant qu'utilisateur, je veux que le contenu soit sauvegardé automatiquement, afin de ne jamais avoir à penser à enregistrer.
12. En tant qu'utilisateur, je veux retrouver le contenu exact d'une Page après rechargement, afin de faire confiance à l'outil.
13. En tant qu'utilisateur, je veux supprimer une Page, afin de me débarrasser de ce dont je n'ai plus besoin.
14. En tant qu'utilisateur, je veux qu'une confirmation m'indique combien de Sous-pages seront supprimées avec la Page, afin d'éviter une suppression accidentelle.
15. En tant qu'utilisateur, je veux pouvoir annuler à la confirmation, afin de garder ma Page intacte.
16. En tant qu'utilisateur, je veux que la suppression retire toute la descendance de la Page, afin de ne laisser aucune Page orpheline.
17. En tant qu'utilisateur, je veux être redirigé vers une Page valide (ou l'état vide) quand je supprime la Page ouverte, afin de ne pas tomber sur une erreur.
18. En tant qu'utilisateur, je veux un état vide clair quand le Workspace n'a aucune Page, afin de savoir comment démarrer.
19. En tant qu'utilisateur, je veux qu'une Page inexistante (lien obsolète) affiche un message clair, afin de ne pas voir une erreur brute.
20. En tant qu'utilisateur, je veux qu'une Page sans titre porte un titre par défaut lisible, afin de la repérer dans la sidebar.
21. En tant qu'utilisateur, je veux retrouver mon arbre et mes contenus au redémarrage de l'app, afin que mes données soient durables.

## Implementation Decisions

- **Vocabulaire** : celui de [CONTEXT.md](../../CONTEXT.md) : Workspace, Page, Sous-page, Block. Le respect de BlockNote prime sur celui de Notion.
- **Module « Pages »** : module profond, indépendant de React et de Next, qui porte toute la logique métier. Interface : créer une Page (avec parent optionnel), renommer, lire l'arbre du Workspace, lire le contenu d'une Page, sauvegarder son contenu, compter les Sous-pages, supprimer en cascade. Les Server Actions de Next ne font que relayer vers ce module.
- **Workspace** : concept présent dans le modèle, mais un seul Workspace existe en v1 (créé à la volée si absent). Pas d'authentification ni de sélecteur.
- **Modèle de Page** : un identifiant, un titre, un parent (Workspace ou Page), une `position` parmi ses sœurs, un `content`, des dates de création et de modification.
- **Contenu** : le `content` est le document JSON de BlockNote, stocké en une colonne, traité comme opaque par le module Pages. Pas de table de Blocks.
- **Ordre** : chaque Page a une `position` parmi ses sœurs, attribuée à la création (à la fin). Le déplacement de Pages (changement de parent ou d'ordre) est hors v1, mais le modèle garde `position` pour pouvoir l'ajouter sans migration lourde.
- **Invariants** : suppression = tout le sous-arbre, définitivement.
- **Persistance** : SQLite côté serveur via le module natif `node:sqlite` (`DatabaseSync`), accès en SQL brut (pas d'ORM), schéma versionné par des fichiers de migration `.sql` écrits à la main. Base dans un fichier local, ignoré par git. `node:sqlite` étant expérimental, le flag `--experimental-sqlite` est ajouté aux scripts `dev`/`build`/`start` via `NODE_OPTIONS`.
- **Suppression** : l'UI demande d'abord le nombre de Sous-pages au module, affiche une confirmation, puis supprime.
- **Sauvegarde automatique** : enregistrement du contenu après une courte inactivité en frappe (debounce), et à la fermeture ou au changement de Page. Le débit exact est laissé à l'implémentation.
- **Navigation** : une route par Page, identifiée par son id. La racine affiche la première Page ou l'état vide.
- **Sidebar** : arbre dépliable, création de Page et de Sous-page, renommage, suppression. L'ébauche existante est à relire, à garder ou à remplacer.
- **Stack** : Next.js 16 (App Router, React 19, React Compiler), Tailwind 4, Headless UI, BlockNote. Next 16 a des changements incompatibles : lire `node_modules/next/dist/docs/` avant d'écrire du code, comme l'exige AGENTS.md.
- **Exécution** : local uniquement.

## Testing Decisions

- **Un seul seam** : le module Pages, appelé directement, contre un SQLite en mémoire avec le vrai schéma SQL. Pas de mocks.
- **Un bon test** : ne vérifie que le comportement observable (l'arbre lu, le contenu relu, les erreurs renvoyées), jamais l'implémentation (noms de colonnes, requêtes SQL, algorithme de `position`).
- **Comportements à couvrir** :
  - une Page créée apparaît sous son parent, à la fin de ses sœurs ;
  - renommer met à jour le titre ;
  - le contenu sauvegardé est identique à celui relu ;
  - le compte de Sous-pages compte toute la descendance, pas seulement les enfants directs ;
  - supprimer retire la Page et toute sa descendance, sans toucher aux autres ;
  - lire une Page inexistante renvoie une erreur explicite.
- **UI non testée automatiquement en v1** (sidebar, BlockNote) : vérification manuelle avec `/run`.
- **Prior art** : aucun. Le repo n'a pas de framework de test ; en choisir un fait partie du premier ticket.

## Out of Scope

Tout ce qui figure dans [docs/backlog.md](../../docs/backlog.md) : bases de données, multi-utilisateur et authentification, collaboration temps réel, déplacement de Pages (changement de parent ou d'ordre, y compris hors drag & drop), corbeille avec restauration, lien de sous-page dans le contenu, Blocks stockés en lignes, recherche, icônes et couvertures, export, mode sombre, raccourcis globaux, drag & drop dans la sidebar, déploiement public.

## Further Notes

- La suppression est définitive : c'est un choix assumé pour la v1, la corbeille est au backlog.
- Le choix de stocker le contenu en un seul JSON BlockNote est réversible tant que les bases de données et la recherche par bloc ne sont pas engagées. Aucun ADR n'est nécessaire pour l'instant.
