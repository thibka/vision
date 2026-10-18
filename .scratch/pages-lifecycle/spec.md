# Cycle de vie des Pages : Page initiale, renommage et suppression

**Status:** ready-for-agent

## Problem Statement

Un Workspace fraîchement créé est vide : j'arrive sur un écran qui affiche un éditeur rattaché à aucune Page, et la sidebar me dit « No pages yet ». Mes Pages s'appellent toutes « Untitled » sans que je puisse changer leur titre, je ne peux pas en supprimer, et ouvrir une Page ne montre qu'un titre, sans éditeur. Je veux qu'un Workspace ait toujours une Page prête à écrire, pouvoir renommer mes Pages et les supprimer.

## Solution

Un Workspace contient toujours au moins une Page. À sa création, qu'il s'agisse du Workspace par défaut ou d'un Workspace créé depuis la sidebar, une Page « New page » est créée en même temps, et j'arrive directement dessus. Ouvrir un Workspace m'amène sur sa plus ancienne Page.

Chaque Page affiche son titre en grand, au-dessus d'un éditeur de Blocks. Je clique sur le titre pour le modifier sur place ; il est enregistré dès que je valide et la sidebar se met à jour.

Chaque ligne de la liste des Pages porte une icône de suppression. Un clic supprime la Page définitivement. Si c'était la dernière Page du Workspace, une nouvelle Page « New page » la remplace aussitôt. Si c'était la Page ouverte, je suis amené sur la plus ancienne Page restante.

## User Stories

### Page initiale

1. En tant qu'utilisateur, je veux que mon Workspace par défaut contienne déjà une Page à ma première visite, afin de pouvoir écrire tout de suite.
2. En tant qu'utilisateur, je veux qu'un Workspace créé depuis la sidebar contienne déjà une Page, afin de ne jamais tomber sur un Workspace vide.
3. En tant qu'utilisateur, je veux que cette Page s'appelle « New page », afin de la reconnaître comme une Page neuve.
4. En tant qu'utilisateur, je veux arriver directement sur cette Page après la création d'un Workspace, afin de ne pas avoir à la chercher.
5. En tant qu'utilisateur, je veux que deux visites simultanées à ma première connexion ne créent ni deux Workspaces par défaut ni deux Pages initiales, afin de ne pas accumuler de doublons.
6. En tant qu'utilisateur, je veux ne jamais voir un Workspace sans Page, même si une erreur survient pendant la création, afin que la règle « au moins une Page » soit toujours vraie.

### Titre par défaut

7. En tant qu'utilisateur, je veux qu'une Page créée par « Create page » s'appelle aussi « New page », afin que toutes les nouvelles Pages portent le même titre par défaut.
8. En tant qu'utilisateur, je veux pouvoir avoir plusieurs Pages intitulées « New page », afin de créer des Pages sans me soucier de leur nom.

### Navigation

9. En tant qu'utilisateur, je veux qu'ouvrir l'adresse d'un Workspace m'amène sur sa plus ancienne Page, afin de toujours voir une Page plutôt qu'un écran vide.
10. En tant qu'utilisateur, je veux que `/` m'amène sur une Page de mon Workspace par défaut, afin d'arriver dans un endroit où écrire.
11. En tant qu'utilisateur, je veux une 404 si j'ouvre l'adresse d'un Workspace qui n'est pas à moi ou qui n'existe pas, comme aujourd'hui, afin que personne ne puisse deviner quels Workspaces existent.

### Affichage d'une Page

12. En tant qu'utilisateur, je veux voir le titre de la Page en grand en haut de la page, afin de savoir où je suis.
13. En tant qu'utilisateur, je veux voir un éditeur de Blocks sous le titre, afin de pouvoir écrire du contenu.
14. En tant qu'utilisateur, je veux que l'éditeur démarre vide, sans répéter le titre, afin de ne pas voir le titre en double.

### Renommage

15. En tant qu'utilisateur, je veux cliquer sur le titre de la Page pour le modifier sur place, afin de la renommer sans ouvrir de formulaire.
16. En tant qu'utilisateur, je veux que le titre soit enregistré quand j'appuie sur Entrée, afin de valider rapidement.
17. En tant qu'utilisateur, je veux que le titre soit enregistré quand je quitte le champ, afin de ne pas perdre ma saisie.
18. En tant qu'utilisateur, je veux que le titre soit enregistré quand j'appuie sur Échap, comme dans Notion, afin que ma saisie ne soit jamais perdue par mégarde.
19. En tant qu'utilisateur, je veux que le nouveau titre apparaisse dans la liste des Pages de la sidebar, afin que la liste reste à jour.
20. En tant qu'utilisateur, je veux retrouver le nouveau titre après un rechargement, afin que le renommage soit durable.
21. En tant qu'utilisateur, je veux que les espaces au début et à la fin du titre soient retirés, afin que les titres restent propres.
22. En tant qu'utilisateur, je veux qu'un titre vidé redevienne « New page », afin qu'aucune Page n'apparaisse sans titre dans la sidebar.
23. En tant qu'utilisateur, je veux ne pas pouvoir saisir plus de 200 caractères dans le titre, afin de garder des titres lisibles.
24. En tant qu'utilisateur, je veux que le filtre de la sidebar trouve une Page par son nouveau titre, afin de la retrouver après l'avoir renommée.
25. En tant qu'utilisateur, je veux qu'on ne puisse jamais renommer une Page d'un Workspace qui n'est pas le mien, afin que mes données et celles des autres restent séparées.
26. En tant que développeur, je veux que le serveur refuse un titre de plus de 200 caractères, afin que la limite ne dépende pas seulement de l'interface.

### Suppression

27. En tant qu'utilisateur, je veux une icône « Delete page » sur chaque ligne de la liste des Pages, afin de supprimer une Page sans l'ouvrir.
28. En tant qu'utilisateur, je veux que cette icône apparaisse au survol de la ligne, afin de garder une liste épurée.
29. En tant qu'utilisateur au clavier, je veux que cette icône apparaisse au focus, afin de pouvoir supprimer une Page sans souris.
30. En tant qu'utilisateur, je veux qu'un clic supprime la Page immédiatement, sans confirmation, afin de ne pas être interrompu.
31. En tant qu'utilisateur, je veux que la Page supprimée disparaisse de la sidebar, afin que la liste reflète l'état réel.
32. En tant qu'utilisateur, je veux qu'une Page supprimée ne réapparaisse pas après un rechargement, afin que la suppression soit définitive.
33. En tant qu'utilisateur, je veux que supprimer la dernière Page d'un Workspace crée aussitôt une Page « New page », afin que le Workspace ne soit jamais vide.
34. En tant qu'utilisateur, je veux être amené sur la plus ancienne Page restante quand je supprime la Page ouverte, afin de ne pas rester sur une adresse morte.
35. En tant qu'utilisateur, je veux être amené sur la nouvelle Page « New page » quand je supprime la Page ouverte et que c'était la dernière, afin d'avoir toujours une Page à l'écran.
36. En tant qu'utilisateur, je veux rester sur la Page ouverte quand je supprime une autre Page depuis la sidebar, afin de ne pas perdre ma place.
37. En tant qu'utilisateur, je veux qu'un double clic sur l'icône de suppression ne provoque pas d'erreur, afin que l'interface reste fiable.
38. En tant qu'utilisateur, je veux qu'on ne puisse jamais supprimer une Page d'un Workspace qui n'est pas le mien, afin que mes données et celles des autres restent séparées.
39. En tant qu'utilisateur, je veux une 404 si j'ouvre l'adresse d'une Page supprimée, afin de comprendre qu'elle n'existe plus.

## Implementation Decisions

- **Glossaire :** `CONTEXT.md` est à jour. Il définit l'invariant « un Workspace contient toujours au moins une Page », le renommage des Pages et le **Titre par défaut** (« New page », repris par une Page renommée avec un titre vide).
- **Titre par défaut :** « New page » remplace « Untitled » pour toute Page créée, manuellement ou automatiquement. Il remplace la décision « Untitled » de la spec `pages-creation`.
- **Module Workspaces :**
  - L'interface est inchangée.
  - `getOrCreateDefault` et `create` créent la Page « New page » à la racine du nouveau Workspace, dans la même transaction que le Workspace.
  - Le module Workspaces écrit donc dans la table des Pages. C'est un choix assumé, pour garder la création atomique, plutôt que deux appels successifs depuis l'action.
  - L'idempotence de `getOrCreateDefault` sous appels concurrents doit couvrir la Page initiale : un seul Workspace par défaut, une seule Page.
- **Module Pages :**
  - `createAtRoot` utilise le Titre par défaut.
  - Nouvelle opération `rename(userId, workspaceId, pageId, title)` :
    - elle retire les espaces en début et en fin de titre, et applique le Titre par défaut si le résultat est vide ;
    - elle renvoie la Page renommée ;
    - elle renvoie `null` pour une Page introuvable, d'un autre Workspace que celui donné, ou d'un Workspace d'un autre utilisateur, sans distinction ;
    - elle lève une erreur si le titre nettoyé dépasse 200 caractères, cas distinct de « introuvable ». La longueur est comptée en caractères, pas en octets.
  - Nouvelle opération `delete(userId, workspaceId, pageId)` :
    - elle renvoie `true` si la Page a été supprimée, `false` dans les mêmes cas d'introuvable que `rename` ;
    - si la Page supprimée était la dernière du Workspace, une Page « New page » est créée à la racine dans la même transaction ;
    - la vérification d'appartenance, la suppression et la recréation forment une seule opération atomique.
  - Pas de nouvelle opération pour trouver la première Page : la plus ancienne est le premier élément de `list`, déjà triée du plus ancien au plus récent.
- **Routes :**
  - La route du Workspace ne rend plus d'éditeur. Après le contrôle d'accès, elle redirige vers la plus ancienne Page du Workspace.
  - La route d'une Page affiche le titre dans un h1 éditable, suivi de l'éditeur BlockNote.
  - Les redirections existantes (racine `/`, après « Create workspace ») passent par la route du Workspace et arrivent donc sur sa Page.
- **Éditeur :**
  - Le composant d'éditeur, aujourd'hui en chantier (il rend un texte de remplacement), rend réellement BlockNote.
  - Il démarre avec un document vide et n'injecte plus de heading « New page ».
  - Son contenu n'est pas sauvegardé.
- **Titre éditable :**
  - Le h1 devient un champ éditable sur place, dans un style de titre.
  - Entrée, blur et Échap valident tous les trois. Il n'y a pas d'annulation.
  - La saisie est bloquée au-delà de 200 caractères.
  - Une Server Action de renommage appelle `rename` et revalide le layout du Workspace pour mettre à jour la sidebar.
  - Valider un titre inchangé n'a pas besoin d'appeler le serveur.
- **Suppression dans la sidebar :**
  - Chaque ligne de la liste des Pages porte une icône « Delete page », visible au survol et au focus clavier, avec un libellé accessible.
  - Une Server Action de suppression appelle `delete` et revalide le layout.
  - Si la Page supprimée est la Page ouverte, elle redirige vers la route du Workspace, qui mène à la plus ancienne Page (éventuellement la nouvelle « New page »). Sinon, l'utilisateur reste sur la Page ouverte.
  - Le bouton est désactivé pendant la suppression, comme « Create page », pour éviter un double envoi. Supprimer une Page déjà supprimée ne doit pas planter : `delete` renvoie `false`.
- **Sidebar :** l'état vide « No pages yet » ne peut plus apparaître et est retiré. Le message « No pages found » du filtre reste.
- **Contrôle d'accès :** inchangé dans son principe. L'identifiant utilisateur vient de Clerk côté serveur, et ni le renommage ni la suppression ne font confiance à un identifiant d'utilisateur fourni par le client.
- **Données existantes :** pas de migration. Les Workspaces locaux créés avant cette règle n'ont pas de Page ; la base locale est supprimée et repart de zéro.

## Testing Decisions

- **Ce qu'est un bon test :**
  - Il vérifie un comportement observable depuis l'extérieur d'un module : ce qui est renvoyé, ce qui est refusé, ce que `list` montre ensuite.
  - Il ne vérifie jamais une requête SQL ni un appel interne.
  - Il n'y a pas de mock du stockage : on utilise un vrai fichier SQLite avec les vraies migrations.
- **Seams :**
  - Les deux modules existants, Workspaces et Pages. Aucun nouveau seam.
  - Les routes, les Server Actions, la sidebar, le titre éditable et l'éditeur ne sont pas testés directement.
- **Prior art :** les tests existants des modules Workspaces et Pages (fichier temporaire, `openDatabase`, construction des modules via leurs fabriques, tests de concurrence entre deux connexions, tests de persistance par fermeture et réouverture).
- **Cas à couvrir, module Workspaces :**
  - `getOrCreateDefault` crée un Workspace qui a exactement une Page, intitulée « New page », à la racine.
  - Des appels successifs ou concurrents à `getOrCreateDefault`, y compris depuis deux connexions, laissent une seule Page.
  - `create` crée un Workspace qui a exactement une Page « New page ».
  - La Page initiale est invisible pour un autre utilisateur.
- **Cas à couvrir, module Pages :**
  - `createAtRoot` crée une Page « New page ». Les tests existants qui attendent « Untitled » sont mis à jour.
  - `list` d'un Workspace fraîchement créé contient la Page initiale. Le test existant « liste vide pour un Workspace sans Pages » est retiré ou adapté, et les tests qui comptent les Pages en tiennent compte.
  - `rename` :
    - il renvoie la Page renommée, et `get` et `list` montrent le nouveau titre ;
    - il retire les espaces en début et en fin de titre ;
    - un titre vide ou fait d'espaces devient « New page » ;
    - un titre de 200 caractères est accepté, un titre de 201 caractères lève une erreur et laisse le titre inchangé ;
    - il renvoie `null` pour une Page introuvable, une Page d'un autre Workspace que celui donné, ou une Page d'un autre utilisateur, sans rien modifier ;
    - le titre survit à une fermeture et réouverture de la base.
  - `delete` :
    - il renvoie `true` et la Page disparaît de `list` et de `get` ;
    - supprimer une Page parmi plusieurs ne crée rien ;
    - supprimer la dernière Page laisse exactement une Page « New page », différente de la Page supprimée ;
    - il renvoie `false` pour une Page déjà supprimée, introuvable, d'un autre Workspace que celui donné, ou d'un autre utilisateur, sans rien supprimer ni créer ;
    - la suppression survit à une fermeture et réouverture de la base.

## Out of Scope

- La sauvegarde du contenu des Blocks : l'éditeur est éphémère, son contenu est perdu au rechargement.
- La corbeille, la restauration d'une Page et la confirmation avant suppression.
- Les Sous-pages et la suppression d'une Page qui en a.
- Le renommage depuis la sidebar ou un menu contextuel.
- La synchronisation entre le titre et un heading de l'éditeur.
- Le renommage et la suppression de Workspaces.
- Une migration des Workspaces existants sans Page.
- La mise à jour en temps réel d'un autre onglet ouvert sur une Page supprimée ou renommée.

## Further Notes

- Le Titre par défaut « New page » est copié à la création, comme le Nom par défaut d'un Workspace : il ne change pas si la constante change plus tard.
- La story 10 de la spec `pages-creation` (« Untitled ») est remplacée par cette spec.
- Supprimer la Page ouverte depuis un autre onglet laisse cet onglet sur une adresse qui donnera une 404 au prochain chargement. C'est accepté.
