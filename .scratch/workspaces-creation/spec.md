# Création de Workspaces depuis la sidebar

**Status:** ready-for-agent

## Problem Statement

Je n'ai qu'un seul Workspace, celui créé à ma première visite, et je ne peux pas en ajouter d'autre. L'onglet « Workspaces » de la sidebar liste mes Workspaces et me permet d'en changer, mais le bouton « Create workspace » est masqué : la liste ne contient jamais qu'un élément. Je veux pouvoir séparer mes Pages dans plusieurs Workspaces.

## Solution

Le bouton « Create workspace » réapparaît en pied de l'onglet « Workspaces ». Un clic crée immédiatement un nouveau Workspace, sans formulaire, qui porte le Nom par défaut (« Thibaut's workspace », ou « My workspace » si je n'ai pas de prénom). Je suis aussitôt amené dessus : il devient le Workspace courant, vide, et apparaît en fin de liste dans l'onglet « Workspaces ». Il est le mien seul, comme tous mes Workspaces.

## User Stories

1. En tant qu'utilisateur, je veux voir un bouton « Create workspace » en pied de l'onglet « Workspaces », afin de savoir comment ajouter un Workspace.
2. En tant qu'utilisateur, je veux créer un Workspace en un clic, sans formulaire, afin de ne pas être interrompu.
3. En tant qu'utilisateur, je veux que le nouveau Workspace s'appelle « <Prénom>'s workspace » (par exemple « Thibaut's workspace »), afin qu'il ait un nom lisible dès sa création.
4. En tant qu'utilisateur dont le prénom est absent ou vide, je veux que le nouveau Workspace s'appelle « My workspace », afin d'avoir un nom lisible malgré tout.
5. En tant qu'utilisateur, je veux que le nom du nouveau Workspace reprenne mon prénom actuel, afin qu'un changement de profil soit pris en compte pour les créations suivantes.
6. En tant qu'utilisateur, je veux que mes Workspaces existants gardent leur nom quand je change de prénom, afin qu'ils ne soient pas renommés sans mon accord.
7. En tant qu'utilisateur, je veux pouvoir avoir plusieurs Workspaces portant le même nom, afin que la création ne soit jamais refusée pour un doublon.
8. En tant qu'utilisateur, je veux être amené sur le Workspace que je viens de créer, afin de commencer à y travailler tout de suite.
9. En tant qu'utilisateur, je veux voir le nom du nouveau Workspace en haut de la sidebar après la création, afin de savoir que j'ai changé de Workspace.
10. En tant qu'utilisateur, je veux arriver sur l'onglet Pages du nouveau Workspace, vide, avec son message d'état vide, afin de savoir comment démarrer.
11. En tant qu'utilisateur, je veux que le nouveau Workspace apparaisse en fin de liste dans l'onglet « Workspaces », afin que l'ordre reste stable, du plus ancien au plus récent.
12. En tant qu'utilisateur, je veux que le compteur de l'onglet « Workspaces » augmente après la création, afin de voir combien j'en ai.
13. En tant qu'utilisateur, je veux que le nouveau Workspace soit mis en évidence comme Workspace courant dans la liste, afin de ne pas me tromper.
14. En tant qu'utilisateur, je veux qu'un double clic sur « Create workspace » ne crée qu'un seul Workspace, afin de ne pas accumuler de doublons involontaires.
15. En tant qu'utilisateur, je veux créer autant de Workspaces que je veux, afin de ne pas être bloqué par une limite arbitraire.
16. En tant qu'utilisateur, je veux pouvoir créer des Pages dans le nouveau Workspace, afin qu'il soit pleinement utilisable.
17. En tant qu'utilisateur, je veux retrouver mes Workspaces créés après un rechargement ou une reconnexion, afin de ne rien perdre.
18. En tant qu'utilisateur, je veux que `/` m'amène toujours sur mon premier Workspace, afin que le point d'entrée ne change pas quand j'en crée d'autres.
19. En tant qu'utilisateur, je veux que les Workspaces que je crée ne soient visibles que par moi, afin que mes données restent séparées de celles des autres.
20. En tant qu'utilisateur non connecté, je veux être renvoyé vers la connexion si je tente de créer un Workspace, afin qu'aucune donnée ne soit exposée.
21. En tant que nouvel utilisateur sans prénom, je veux que mon Workspace par défaut s'appelle « My workspace », afin que le nom de repli soit le même pour tous les Workspaces.

## Implementation Decisions

- **Vocabulaire :** `CONTEXT.md` est à jour. Il introduit le **Nom par défaut** (« <Prénom>'s workspace », ou « My workspace » sans prénom), que reçoit tout Workspace à sa création, et réduit le **Workspace par défaut** au premier Workspace créé automatiquement. Il précise que plusieurs Workspaces peuvent porter le même nom.
- **Nom par défaut :**
  - Une seule règle sert à la fois au Workspace par défaut et aux Workspaces créés depuis la sidebar.
  - Le nom de repli passe de « Workspace 1 » à « My workspace ». Un prénom vide ou composé seulement d'espaces compte comme absent.
  - Le prénom vient du profil Clerk et il est lu au moment de chaque création. Le nom est copié et ne suit pas le profil ensuite.
  - Les Workspaces déjà en base qui s'appellent « Workspace 1 » ne sont pas renommés : pas de migration.
- **Module Workspaces :**
  - Il gagne une opération de création qui prend l'identifiant utilisateur et un chargeur de prénom, sur le modèle de « obtenir ou créer le Workspace par défaut ». Elle insère toujours un nouveau Workspace, même si l'utilisateur en a déjà, et renvoie le Workspace créé (identifiant et nom).
  - Elle n'impose aucune unicité de nom et aucune limite de nombre.
  - « Obtenir ou créer le Workspace par défaut » garde son comportement : il renvoie le premier Workspace créé, et ne crée le Workspace par défaut que si l'utilisateur n'en a aucun.
  - Pas de changement de schéma : la table des Workspaces accepte déjà plusieurs Workspaces par utilisateur, sans contrainte sur le nom.
- **Server action :**
  - Une action serveur « créer un Workspace » authentifie l'utilisateur via Clerk, appelle le module avec le chargeur de prénom de Clerk, revalide le layout du Workspace pour rafraîchir la sidebar, puis redirige vers `/[nouveauWorkspaceId]`.
  - Elle ne prend aucun paramètre venant du client : le Workspace est toujours créé pour l'utilisateur connecté.
- **Sidebar :**
  - L'onglet « Workspaces » retrouve son pied d'onglet, séparé par une bordure, avec le bouton « Create workspace ». Il reprend la présentation et le comportement de « Create page » : un formulaire qui appelle l'action, et un bouton désactivé pendant la création pour éviter un double clic.
  - Après la redirection, la sidebar affiche le nouveau Workspace courant : son nom en haut, l'onglet Pages par défaut, et la liste des Workspaces avec le nouveau en dernier, mis en évidence.
- **Point d'entrée :** `/` redirige toujours vers le premier Workspace créé. Le Workspace créé depuis la sidebar est un Workspace ordinaire, sans statut particulier.
- **Libellés :** en anglais, comme le reste de l'interface (« Create workspace », « My workspace »).

## Testing Decisions

- **Ce qu'est un bon test :** il vérifie un comportement observable depuis l'extérieur du module, c'est-à-dire ce qui est renvoyé et ce qui est listé ensuite, jamais les détails d'implémentation. Pas de mock du stockage : on utilise une vraie base SQLite avec les vraies migrations.
- **Seam unique :** l'interface du module Workspaces. La server action, le bouton et la sidebar sont de fins adaptateurs et ne sont pas testés directement.
- **Cas à couvrir pour la création :**
  - Chaque appel crée un nouveau Workspace, y compris quand l'utilisateur en a déjà un.
  - Le nom vaut « Thibaut's workspace » pour un prénom renseigné, et « My workspace » pour un prénom vide, blanc, `null` ou `undefined`.
  - Deux créations successives peuvent produire deux Workspaces de même nom.
  - Le nom reprend le prénom au moment de la création : après un changement de prénom, le nouveau Workspace porte le nouveau prénom et les anciens gardent leur nom.
  - Le Workspace créé est listé en dernier et lisible par son propriétaire.
  - Il n'est ni lisible ni listé pour un autre utilisateur.
  - « Obtenir ou créer le Workspace par défaut » renvoie toujours le premier Workspace créé après des créations.
  - Les Workspaces créés survivent à la fermeture et à la réouverture de la base.
- **Tests existants :** les cas « Workspace 1 » du Workspace par défaut passent à « My workspace ». Ceux qui insèrent un second Workspace directement en base pour tester l'ordre peuvent garder cette insertion, qui fixe des dates de création précises.
- **Calendrier :** conformément à `AGENTS.md`, pas de TDD. Les tests sont écrits après l'implémentation, une fois le comportement stable.
- **Prior art :** les tests existants du module Workspaces et du module Pages : vraie base temporaire par test, vraies migrations, chargeur de prénom injecté.

## Out of Scope

- Le renommage de Workspace (chantier séparé, qui inclura le nom affiché en haut de la sidebar).
- La suppression de Workspace.
- La redirection de `/` vers le dernier Workspace visité (à ajouter au backlog).
- Le choix du nom à la création (formulaire, champ de saisie ou boîte de dialogue).
- Le renommage des Workspaces existants nommés « Workspace 1 ».
- Le partage de Workspace entre utilisateurs (voir `docs/backlog.md`).

## Further Notes

- `AGENTS.md` prévient que cette version de Next.js a des changements incompatibles : lire `node_modules/next/dist/docs/` avant d'écrire du code, notamment pour les server actions, `revalidatePath` et `redirect`.
- La spec précédente (`.scratch/pages-creation/spec.md`) classait la création de Workspace hors périmètre et demandait de masquer le bouton. Cette spec lève cette restriction.
