# Contenu d'une Page : enregistré automatiquement et retrouvé partout

**Status:** ready-for-agent

## Problem Statement

J'écris dans l'éditeur d'une Page, puis je clique sur une autre Page de la sidebar. Quand je reviens, l'éditeur est vide : tout ce que j'avais écrit a disparu. Il se passe la même chose au rechargement. Le titre de ma Page est conservé, mais pas son Contenu, ce qui rend l'éditeur inutilisable pour prendre des notes.

## Solution

Le Contenu d'une Page est enregistré automatiquement pendant que j'écris, sans bouton ni action de ma part. Je le retrouve tel que je l'ai laissé en revenant sur la Page : après un changement de Page, un rechargement, un redémarrage du serveur ou dans un autre onglet.

L'enregistrement part environ une seconde après ma dernière frappe. Ce qui n'est pas encore enregistré part immédiatement quand je quitte la Page ou que je ferme l'onglet. Tant que tout va bien, je ne vois rien. Si un enregistrement échoue, un message discret me le dit. Si je ferme l'onglet alors qu'un enregistrement n'est pas terminé, le navigateur me prévient.

## User Stories

### Retrouver son Contenu

1. En tant qu'utilisateur, je veux retrouver le Contenu d'une Page quand j'y reviens depuis une autre Page, afin de ne jamais perdre ce que j'ai écrit en naviguant.
2. En tant qu'utilisateur, je veux retrouver le Contenu d'une Page après un rechargement, afin que mes notes soient durables.
3. En tant qu'utilisateur, je veux retrouver le Contenu de mes Pages après un redémarrage de l'application, afin que mes notes survivent comme mes titres.
4. En tant qu'utilisateur, je veux voir le Contenu enregistré d'une Page dans un autre onglet que celui où je l'ai écrit, afin que le Contenu ne dépende pas de l'onglet.
5. En tant qu'utilisateur, je veux qu'une Page que je n'ai jamais remplie s'ouvre avec un Contenu vide, afin de pouvoir commencer à écrire tout de suite.
6. En tant qu'utilisateur, je veux qu'une Page nouvellement créée s'ouvre avec un Contenu vide, sans heading qui répète son titre, comme aujourd'hui.
7. En tant qu'utilisateur, je veux que chaque Page ait son propre Contenu, afin que ce que j'écris dans une Page n'apparaisse jamais dans une autre.
8. En tant qu'utilisateur, je veux qu'en passant d'une Page à une autre, l'éditeur affiche immédiatement le Contenu de la Page ouverte, sans reste de la précédente.
9. En tant qu'utilisateur, je veux retrouver les Blocks tels que je les ai laissés : leur ordre, leur type, leur imbrication, leur mise en forme et l'état coché des to-dos, afin que le Contenu soit restitué fidèlement.
10. En tant qu'utilisateur, je veux que tous les Blocks proposés par l'éditeur soient conservés, y compris les tableaux et les médias intégrés par URL, afin de ne pas avoir à savoir lesquels survivent.
11. En tant qu'utilisateur, je veux qu'une Page dont j'ai effacé tout le Contenu reste vide quand j'y reviens, afin que l'effacement soit enregistré lui aussi.

### Enregistrement automatique

12. En tant qu'utilisateur, je veux que le Contenu s'enregistre sans que j'aie à cliquer sur un bouton ni à quitter un champ, afin d'écrire sans y penser.
13. En tant qu'utilisateur, je veux que l'enregistrement parte peu après ma dernière frappe plutôt qu'à chaque touche, afin que l'écriture reste fluide.
14. En tant qu'utilisateur, je veux que ce que j'ai écrit juste avant de cliquer sur une autre Page soit enregistré, afin de pouvoir changer de Page sans attendre.
15. En tant qu'utilisateur, je veux que le changement de Page soit immédiat, même si un enregistrement est en cours, afin que la navigation ne soit jamais ralentie.
16. En tant qu'utilisateur, je veux qu'en revenant sur une Page juste après l'avoir quittée, l'éditeur affiche le dernier Contenu que j'ai tapé, même si son enregistrement n'était pas terminé, afin de ne jamais voir une version antérieure.
17. En tant qu'utilisateur, je veux qu'un enregistrement ancien et lent ne puisse jamais écraser un enregistrement plus récent, afin que le dernier état écrit soit toujours celui qui reste.
18. En tant qu'utilisateur, je veux que ce que j'ai écrit juste avant de recharger ou de fermer l'onglet soit enregistré si possible, afin de perdre le moins possible.
19. En tant qu'utilisateur, je veux que le navigateur me prévienne si je ferme ou recharge l'onglet alors qu'un enregistrement n'est pas terminé, afin de ne jamais perdre de texte sans le savoir.
20. En tant qu'utilisateur, je veux que ce même avertissement n'apparaisse pas quand tout est enregistré, afin de ne pas être dérangé pour rien.
21. En tant qu'utilisateur, je veux qu'ouvrir une Page sans la modifier n'enregistre rien, afin de ne pas faire d'enregistrement inutile.
22. En tant qu'utilisateur, je veux que l'enregistrement du Contenu ne fasse pas clignoter ni recharger la sidebar, afin que la liste des Pages reste stable pendant que j'écris.

### Échecs

23. En tant qu'utilisateur, je veux ne rien voir quand l'enregistrement fonctionne, afin que l'interface reste épurée.
24. En tant qu'utilisateur, je veux voir un message discret quand un enregistrement échoue, par exemple serveur arrêté ou Contenu trop gros, afin de savoir que mon texte n'est pas en sécurité.
25. En tant qu'utilisateur, je veux que mon texte reste dans l'éditeur après un échec, afin de ne rien perdre de ce qui est affiché.
26. En tant qu'utilisateur, je veux que ma modification suivante retente l'enregistrement après un échec, afin que tout reparte sans action particulière.
27. En tant qu'utilisateur, je veux que le message d'échec disparaisse dès qu'un enregistrement réussit, afin de savoir que tout est de nouveau enregistré.
28. En tant qu'utilisateur, je veux que le navigateur me prévienne aussi à la fermeture de l'onglet si le dernier enregistrement a échoué, afin de ne pas perdre ce texte sans le savoir.
29. En tant qu'utilisateur, je veux tomber sur une 404 si j'écris dans une Page supprimée entre-temps depuis un autre onglet, comme quand je la renomme, afin de ne pas continuer à écrire dans une Page qui n'existe plus.

### Accès et cycle de vie

30. En tant qu'utilisateur, je veux que personne d'autre ne puisse lire ni modifier le Contenu de mes Pages, afin que mes notes restent privées.
31. En tant qu'utilisateur, je veux qu'une Page ouverte avec un mauvais Workspace dans l'adresse donne toujours une 404, sans exposer son Contenu.
32. En tant qu'utilisateur, je veux que supprimer une Page supprime aussi son Contenu, afin qu'il ne reste rien d'une Page supprimée.
33. En tant qu'utilisateur, je veux que supprimer un Workspace supprime le Contenu de toutes ses Pages, comme ses Pages.
34. En tant qu'utilisateur, je veux que la Page « New page » recréée après la suppression de la dernière Page ait un Contenu vide, afin qu'elle ne reprenne rien de la Page supprimée.
35. En tant qu'utilisateur, je veux que renommer une Page ne touche pas à son Contenu, et qu'écrire dans son Contenu ne touche pas à son titre.
36. En tant qu'utilisateur ayant déjà des Pages, je veux qu'elles s'ouvrent avec un Contenu vide après la mise à jour, sans perte de mes Workspaces, Pages et titres.

## Implementation Decisions

- **Glossaire :** **Contenu** est ajouté à `CONTEXT.md` : le document de Blocks d'une Page, vide à la création et durable. La liste des Blocks donnée dans le glossaire n'est plus qu'une série d'exemples.
- **Stockage (ADR 0002) :** le Contenu est enregistré en un seul document JSON par Page, tel que BlockNote le produit.
  - Une nouvelle migration ajoute une colonne texte `content` à la table `pages`, à `NULL` tant que la Page n'a jamais été écrite. Les Pages existantes restent intactes et ont un Contenu vide.
  - Pas de table séparée, pas de stockage par Block.
  - Le Contenu vit dans la ligne de la Page. Il disparaît donc avec elle à la suppression d'une Page ou d'un Workspace, sans code supplémentaire. Une Page créée, y compris la « New page » de remplacement, a un Contenu `NULL`.
- **Module Pages, nouvelle opération de lecture du Contenu** `(userId, workspaceId, pageId)` :
  - elle renvoie le Contenu sous forme de tableau de Blocks ;
  - elle renvoie un tableau vide pour une Page jamais écrite ;
  - elle renvoie `null` pour une Page introuvable, d'un autre Workspace que celui donné, ou d'un Workspace d'un autre utilisateur, sans distinction, comme `get`.
  - `get` et `list` ne chargent pas le Contenu : la sidebar n'en a pas besoin.
- **Module Pages, nouvelle opération d'enregistrement du Contenu** `(userId, workspaceId, pageId, content)` :
  - elle remplace le Contenu entier de la Page ;
  - elle renvoie `true` si la Page a été écrite, `false` dans les mêmes cas d'introuvable que `rename`, sans rien modifier ;
  - la vérification d'appartenance et l'écriture forment une seule requête, comme pour `rename` et `delete` ;
  - elle lève une erreur si le Contenu n'est pas un tableau, ou si sa forme sérialisée dépasse 1 Mo (mesurés en octets UTF-8). Ce cas est distinct de « introuvable », et le Contenu enregistré reste alors inchangé ;
  - elle ne valide pas le schéma BlockNote : le serveur ne dépend pas de la version de BlockNote ;
  - elle ne touche pas au titre, et `rename` ne touche pas au Contenu.
- **Route d'une Page :** après le contrôle d'accès existant, elle lit le Contenu de la Page et le passe à l'éditeur comme Contenu initial. L'éditeur est keyé par Page, comme le champ titre, pour repartir de zéro sur chaque Page. Un Contenu vide se traduit par un éditeur vide : BlockNote refuse un document initial sans aucun Block.
- **Server Action d'enregistrement :**
  - elle prend l'identifiant de l'utilisateur de Clerk côté serveur, jamais du client ;
  - elle appelle l'opération d'enregistrement, et rend la 404 (`notFound`) quand celle-ci renvoie `false`, comme `renamePage` ;
  - elle ne revalide pas le layout : la sidebar n'affiche pas le Contenu ;
  - une erreur de validation remonte au client comme un échec d'enregistrement.
- **Planificateur d'enregistrement (nouveau module client, sans dépendance à React ni à BlockNote) :** il reçoit une fonction d'enregistrement asynchrone et un délai. Il expose ces opérations :
  - signaler une modification, avec le Contenu courant ;
  - enregistrer maintenant ;
  - savoir si quelque chose n'est pas encore enregistré : modification en attente, enregistrement en cours, ou dernier enregistrement échoué ;
  - connaître l'état d'échec et en être notifié, pour afficher le message ;
  - lire le dernier Contenu signalé.

  Ses règles :
  - un enregistrement part un délai (environ 1 s) après la dernière modification signalée. Une nouvelle modification relance le délai ;
  - « enregistrer maintenant » envoie tout de suite ce qui est en attente, et ne fait rien s'il n'y a rien en attente ;
  - un seul enregistrement est en cours à la fois. Les modifications arrivées pendant ce temps sont regroupées en un enregistrement suivant, qui ne part qu'à la fin du premier et ne contient que le dernier Contenu. Un enregistrement ne peut donc jamais écraser un plus récent ;
  - un échec passe le planificateur en état d'échec et garde le Contenu comme non enregistré. Il n'y a pas de nouvelle tentative automatique : la modification suivante relance le cycle normal, et un enregistrement réussi efface l'état d'échec ;
  - rien n'est enregistré tant qu'aucune modification n'a été signalée.
- **Contenu non confirmé conservé côté client :** les planificateurs vivent dans un registre côté client, indexé par identifiant de Page, qui survit au démontage de l'éditeur.
  - Quand on quitte une Page, son éditeur déclenche « enregistrer maintenant ». Le planificateur reste dans le registre tant que quelque chose n'est pas enregistré, puis en est retiré.
  - À l'ouverture d'une Page, si le registre a encore un planificateur pour elle, l'éditeur part de son dernier Contenu plutôt que de celui venu du serveur, et continue avec ce même planificateur. C'est ce qui garantit la story 16 sans retarder la navigation.
- **Composant éditeur :**
  - il signale chaque modification du document au planificateur de sa Page ;
  - il affiche le message discret d'échec tant que le planificateur est en état d'échec ;
  - il déclenche « enregistrer maintenant » à son démontage et à la fermeture de l'onglet ;
  - tant que le planificateur a quelque chose de non enregistré, il active l'avertissement natif du navigateur à la fermeture ou au rechargement de l'onglet.
- **Médias :** aucun gestionnaire d'upload n'est branché. Les Blocks médias ne permettent que l'intégration par URL, et l'URL est enregistrée avec le reste du Contenu.

## Testing Decisions

- **Ce qu'est un bon test :**
  - Il vérifie un comportement observable depuis l'extérieur d'un module : ce qui est renvoyé, ce qui est refusé, ce qu'une lecture montre ensuite, quels enregistrements partent et dans quel ordre.
  - Il ne vérifie ni une requête SQL, ni un appel interne, ni un état privé.
  - Il n'y a pas de mock du stockage : on utilise un vrai fichier SQLite avec les vraies migrations.
- **Seams :**
  - le module Pages, existant ;
  - le planificateur d'enregistrement, nouveau, testé dans l'environnement Node actuel avec de fausses horloges et une fonction d'enregistrement factice dont on contrôle la résolution ;
  - le registre, le composant éditeur, la route et la Server Action ne sont pas testés directement.
- **Prior art :** les tests du module Pages, en particulier ceux de `rename` (accès, Workspace erroné, autre utilisateur, limite de taille, persistance par fermeture et réouverture de la base), et l'usage de `vi.useFakeTimers` déjà présent dans ces tests.
- **Ordre :** comme le veut le projet, les tests sont écrits après l'implémentation, une fois le comportement stable.
- **Cas à couvrir, module Pages :**
  - Lecture :
    - une Page jamais écrite renvoie un tableau vide ;
    - une Page nouvellement créée, et la « New page » qui remplace la dernière Page supprimée, ont un Contenu vide ;
    - lire une Page introuvable, avec le mauvais Workspace, ou d'un autre utilisateur renvoie `null`.
  - Enregistrement :
    - il renvoie `true`, et la lecture renvoie ensuite le Contenu enregistré, à l'identique, y compris des Blocks imbriqués et des propriétés arbitraires ;
    - un deuxième enregistrement remplace le premier ;
    - un tableau vide est accepté et relu vide ;
    - il n'écrit que la Page visée ;
    - il ne change pas le titre, et `rename` ne change pas le Contenu ;
    - il renvoie `false` pour une Page introuvable, avec le mauvais Workspace, ou d'un autre utilisateur, sans rien modifier ;
    - il lève une erreur pour un Contenu qui n'est pas un tableau, et pour un Contenu de plus de 1 Mo une fois sérialisé, en laissant le Contenu précédent inchangé. Un Contenu juste sous la limite est accepté ;
    - le Contenu survit à une fermeture et réouverture de la base.
- **Cas à couvrir, planificateur d'enregistrement :**
  - Délai :
    - rien ne part avant le délai ;
    - un enregistrement part après le délai, avec le dernier Contenu ;
    - des modifications rapprochées ne donnent qu'un enregistrement.
  - « Enregistrer maintenant » :
    - il envoie tout de suite ce qui est en attente, et l'enregistrement différé ne repart pas ensuite ;
    - il ne fait rien sans modification en attente.
  - Ordre :
    - pendant un enregistrement en cours, aucun autre ne part ;
    - les modifications de ce moment partent ensemble à sa fin, avec le dernier Contenu seulement ;
    - il n'y a jamais deux enregistrements en même temps.
  - « Quelque chose n'est pas enregistré » :
    - vrai pendant le délai et pendant un enregistrement en cours ;
    - faux une fois tout enregistré ;
    - vrai après un échec.
  - Échec :
    - un enregistrement qui échoue passe en état d'échec, notifie, et ne retente pas seul ;
    - la modification suivante relance un enregistrement ;
    - sa réussite efface l'état d'échec.
  - Sans modification signalée, rien n'est jamais enregistré.

## Out of Scope

- L'upload de fichiers pour les Blocks médias : seule l'intégration par URL est possible.
- Un indicateur d'enregistrement permanent (« Enregistrement… », « Enregistré »).
- La détection de conflits entre deux onglets ouverts sur la même Page : le dernier enregistrement gagne, silencieusement.
- La fusion et la collaboration temps réel.
- La mise à jour en direct d'un autre onglet ouvert sur la Page.
- Une nouvelle tentative automatique après un échec, et un mode hors-ligne.
- Le stockage d'un Block par ligne, la recherche dans le Contenu, les liens vers un Block.
- La validation du schéma BlockNote côté serveur.
- Qu'Entrée dans le titre envoie le curseur dans le premier Block de l'éditeur.
- Un historique ou des versions du Contenu.

## Further Notes

- La décision de stockage est consignée dans l'ADR 0002. Elle remplace l'exclusion « La sauvegarde du contenu des Blocks » de la spec `pages-lifecycle`.
- À la fermeture de l'onglet, l'enregistrement immédiat n'est pas garanti : le navigateur peut couper la requête. L'avertissement natif est le filet de sécurité qui garantit que la perte n'est jamais silencieuse.
- La limite de 1 Mo est une borne de protection, pas une contrainte métier. Un Contenu de notes ordinaire en est très loin, puisque les médias ne sont que des URL.
