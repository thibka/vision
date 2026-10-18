# Cycle de vie des Workspaces : suppression

**Status:** ready-for-agent

## Problem Statement

Je peux créer autant de Workspaces que je veux depuis la sidebar, mais je ne peux pas en supprimer. Un Workspace créé par erreur ou devenu inutile reste dans ma liste pour toujours. Je veux pouvoir supprimer un Workspace depuis l'onglet « Workspaces » de la sidebar, comme je supprime déjà une Page depuis l'onglet « Pages ».

## Solution

Chaque ligne de la liste des Workspaces porte une icône de suppression, visible au survol et au focus clavier, comme pour les Pages. Un clic ouvre la confirmation native du navigateur, qui nomme le Workspace et prévient que ses Pages seront supprimées. Si je confirme, le Workspace et toutes ses Pages sont supprimés définitivement.

Je ne peux jamais supprimer mon dernier Workspace : quand il ne m'en reste qu'un, l'icône n'apparaît pas.

Si je supprime le Workspace courant, je suis amené sur mon plus ancien Workspace restant, ouvert sur sa plus ancienne Page. Sinon, je reste où je suis et la sidebar se met à jour.

## User Stories

1. En tant qu'utilisateur, je veux voir une icône « Delete workspace » au survol d'une ligne de la liste des Workspaces, afin de savoir comment supprimer un Workspace.
2. En tant qu'utilisateur au clavier, je veux que l'icône apparaisse quand la ligne a le focus, et qu'elle ait un libellé accessible, afin de pouvoir supprimer un Workspace sans souris.
3. En tant qu'utilisateur, je veux une confirmation avant la suppression, qui nomme le Workspace et prévient que ses Pages seront supprimées, afin de ne pas perdre toutes mes Pages sur un clic malheureux.
4. En tant qu'utilisateur, je veux qu'annuler la confirmation ne supprime rien, afin de pouvoir revenir sur mon geste.
5. En tant qu'utilisateur, je veux que le Workspace supprimé disparaisse de la sidebar et ne revienne pas après un rechargement, afin que la suppression soit effective.
6. En tant qu'utilisateur, je veux que toutes les Pages du Workspace, Sous-pages comprises, soient supprimées avec lui, afin de ne laisser aucune Page orpheline.
7. En tant qu'utilisateur, je veux ne jamais voir un Workspace à moitié supprimé, même si une erreur survient, afin que le Workspace et ses Pages disparaissent ensemble ou pas du tout.
8. En tant qu'utilisateur qui n'a qu'un seul Workspace, je ne veux pas voir d'icône de suppression, afin de ne jamais me retrouver sans Workspace.
9. En tant qu'utilisateur qui filtre la liste des Workspaces, je veux que l'icône reste disponible tant que j'ai plusieurs Workspaces, même si le filtre n'en affiche qu'un, afin que le filtre ne change pas ce que je peux faire.
10. En tant qu'utilisateur, je veux que deux onglets qui suppriment chacun l'un de mes deux derniers Workspaces m'en laissent toujours un, afin que la règle « au moins un Workspace » tienne en toute circonstance.
11. En tant qu'utilisateur, je veux que supprimer le Workspace courant m'amène sur mon plus ancien Workspace restant, ouvert sur sa plus ancienne Page, afin de ne jamais rester sur un Workspace qui n'existe plus.
12. En tant qu'utilisateur, je veux que supprimer un autre Workspace que le courant me laisse sur la Page ouverte, afin de ne pas être interrompu.
13. En tant qu'utilisateur, je veux que le compteur de l'onglet « Workspaces » diminue après la suppression, afin de voir combien il m'en reste.
14. En tant qu'utilisateur, je veux pouvoir supprimer mon premier Workspace, celui créé à ma première visite, dès qu'il m'en reste un autre, afin qu'il ne soit pas traité à part.
15. En tant qu'utilisateur, je veux que `/` m'amène sur mon plus ancien Workspace restant après la suppression du premier, afin que le point d'entrée fonctionne toujours.
16. En tant qu'utilisateur, je veux qu'un double clic sur l'icône ne provoque pas d'erreur, afin que la suppression reste fiable.
17. En tant qu'utilisateur, je veux que supprimer un Workspace déjà supprimé, par exemple depuis un autre onglet, ne plante pas, afin de ne pas voir d'erreur pour rien.
18. En tant qu'utilisateur, je veux que l'adresse d'un Workspace supprimé, ou d'une de ses Pages, donne une 404, afin qu'un ancien lien ne montre rien de ce qui a été supprimé.
19. En tant qu'utilisateur, je veux qu'on ne puisse jamais supprimer un Workspace qui n'est pas le mien, afin que mes données restent protégées.
20. En tant qu'utilisateur non connecté, je veux être renvoyé vers la connexion si je tente de supprimer un Workspace, afin qu'aucune donnée ne soit touchée.

## Implementation Decisions

- **Vocabulaire :** `CONTEXT.md` est à jour. Le **Workspace** précise que sa suppression supprime définitivement toutes ses Pages, et qu'il ne peut être supprimé que s'il en reste un autre. Le **Workspace par défaut** précise que ce statut ne vaut qu'à sa création : il est ensuite un Workspace ordinaire, supprimable comme les autres.
- **Module Workspaces :**
  - Il gagne une opération de suppression qui prend l'identifiant utilisateur et celui du Workspace, et renvoie `true` si le Workspace a été supprimé.
  - Elle renvoie `false`, sans rien supprimer, pour un Workspace introuvable ou déjà supprimé, pour celui d'un autre utilisateur et pour le dernier Workspace de l'utilisateur. Elle ne fait pas de distinction entre ces cas.
  - Elle supprime les Pages du Workspace puis le Workspace dans une même transaction, prise en écriture dès le début (`immediate`). Elle vérifie à l'intérieur qu'il reste un autre Workspace, pour que deux suppressions concurrentes ne puissent pas supprimer les deux derniers.
  - Les Pages sont supprimées en une seule instruction : la clé étrangère `parent_id` des Sous-pages est vérifiée en fin d'instruction, donc l'ordre des lignes n'a pas d'importance.
  - Pas de changement de schéma : `pages.workspace_id` n'a pas de `ON DELETE CASCADE`, et la suppression explicite des Pages évite une reconstruction de table SQLite.
- **Server action :**
  - Une action serveur « supprimer un Workspace » prend l'identifiant du Workspace à supprimer et un booléen « c'est le Workspace courant ». Elle authentifie l'utilisateur via Clerk, appelle le module, puis revalide le layout du Workspace pour rafraîchir la sidebar.
  - Si c'était le Workspace courant, elle redirige vers `/`, qui mène au plus ancien Workspace restant puis à sa plus ancienne Page. Le booléen vient du client, mais il ne décide que de la destination : la suppression vérifie toujours les droits.
  - Un résultat `false` n'est pas une erreur : il n'y a plus rien à faire.
- **Sidebar :**
  - Chaque ligne de l'onglet « Workspaces » reprend la présentation de la ligne de Page : une icône poubelle (`TrashIcon`) positionnée à droite, masquée jusqu'au survol ou au focus de la ligne, avec `aria-label` et `title` « Delete workspace », et désactivée pendant la suppression.
  - L'icône n'est rendue que si l'utilisateur a au moins deux Workspaces, comptés sur la liste complète et non sur la liste filtrée.
  - Le formulaire de suppression demande une confirmation native (`confirm`) avant d'envoyer l'action, avec par exemple « Delete "Thibaut's workspace" and all its pages? ». Si l'utilisateur annule, rien n'est envoyé.
  - La mise en évidence du Workspace courant et le survol de la ligne restent lisibles quand le pointeur est sur l'icône.
- **Libellés :** en anglais, comme le reste de l'interface.

## Testing Decisions

- **Ce qu'est un bon test :** il vérifie un comportement observable depuis l'extérieur du module, c'est-à-dire ce qui est renvoyé, puis ce que `list` et `get` renvoient ensuite, jamais les détails d'implémentation. Pas de mock du stockage : on utilise une vraie base SQLite avec les vraies migrations.
- **Seam unique :** l'interface du module Workspaces, et celle du module Pages pour vérifier que les Pages ont disparu. La server action, le bouton et la sidebar sont de fins adaptateurs et ne sont pas testés directement.
- **Cas à couvrir pour la suppression :**
  - Elle renvoie `true`, et le Workspace n'est plus listé ni lisible.
  - Les Pages du Workspace supprimé, Sous-pages comprises, ne sont plus lisibles, et `list` des Pages renvoie `null` pour ce Workspace.
  - Les autres Workspaces de l'utilisateur et leurs Pages sont intacts.
  - Elle renvoie `false` pour le dernier Workspace de l'utilisateur, qui reste listé avec ses Pages.
  - Elle renvoie `false` pour un Workspace déjà supprimé ou introuvable.
  - Elle renvoie `false` pour le Workspace d'un autre utilisateur, qui reste intact, même quand l'appelant a plusieurs Workspaces.
  - Le premier Workspace créé est supprimable s'il en reste un autre, et « obtenir ou créer le Workspace par défaut » renvoie ensuite le plus ancien Workspace restant, sans en créer.
  - La suppression survit à la fermeture et à la réouverture de la base.
- **Calendrier :** conformément à `AGENTS.md`, pas de TDD. Les tests sont écrits après l'implémentation, une fois le comportement stable.
- **Prior art :** les tests existants des modules Workspaces et Pages, notamment ceux de la suppression de Page : une vraie base temporaire par test, les vraies migrations et un chargeur de prénom injecté.

## Out of Scope

- Le renommage de Workspace (chantier séparé, qui pourra rejoindre ce dossier).
- La corbeille et la restauration d'un Workspace supprimé (voir `docs/backlog.md`).
- Le déplacement des Pages d'un Workspace vers un autre avant sa suppression.
- Une boîte de dialogue de confirmation personnalisée : la confirmation native suffit pour l'instant.
- La conservation de l'onglet actif de la sidebar après la redirection : on arrive sur l'onglet Pages.

## Further Notes

- `AGENTS.md` prévient que cette version de Next.js a des changements incompatibles : lire `node_modules/next/dist/docs/` avant d'écrire du code, notamment pour les server actions, `revalidatePath` et `redirect`.
- La spec de création (`.scratch/workspaces-creation/spec.md`) classait la suppression de Workspace hors périmètre. Cette spec la traite.
