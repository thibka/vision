# 01: Le Contenu d'une Page est enregistré et relu

**What to build:** J'écris dans l'éditeur d'une Page et, environ une seconde après ma dernière frappe, le Contenu est enregistré sans action de ma part. Je recharge et je le retrouve à l'identique : les Blocks, leur ordre, leur imbrication, leur mise en forme, l'état coché des to-dos, les tableaux et les médias intégrés par URL. Je le retrouve aussi dans un autre onglet et après un redémarrage. Une Page jamais écrite, y compris une Page nouvellement créée ou la « New page » qui remplace la dernière Page supprimée, s'ouvre avec un Contenu vide. Chaque Page a son propre Contenu, et renommer une Page ne touche pas à son Contenu. Personne ne peut lire ni écrire le Contenu d'une Page qui n'est pas la sienne. Écrire dans une Page supprimée entre-temps depuis un autre onglet donne une 404, comme pour le renommage. L'enregistrement ne fait pas recharger la sidebar.

Ce ticket pose :
- **le stockage** : une colonne JSON sur la table des Pages, à `NULL` tant que la Page n'a jamais été écrite (voir ADR 0002) ;
- **deux opérations du module Pages** :
  - la lecture renvoie le Contenu, un tableau vide pour une Page jamais écrite, et `null` dans les cas d'introuvable de `get` ;
  - l'enregistrement remplace le Contenu entier et renvoie `true`, ou `false` dans les cas d'introuvable de `rename`. Il lève une erreur pour un Contenu qui n'est pas un tableau ou qui dépasse 1 Mo une fois sérialisé ;
- **une Server Action** qui ne revalide pas le layout ;
- **la route**, qui passe le Contenu initial à l'éditeur, keyé par Page ;
- **le cœur du planificateur d'enregistrement**, un module client sans dépendance à React ni à BlockNote :
  - il enregistre après un délai ;
  - il n'a qu'un enregistrement en cours à la fois ;
  - les modifications arrivées pendant un enregistrement partent ensemble à sa fin, avec le dernier Contenu seulement ;
  - il n'enregistre rien tant qu'aucune modification n'a été signalée.

Spec : `.scratch/page-content/spec.md`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Une migration ajoute le Contenu à la table des Pages. Les Pages, titres et Workspaces existants sont intacts et s'ouvrent avec un Contenu vide.
- [ ] Le Contenu écrit dans une Page est retrouvé après un rechargement, dans un autre onglet et après un redémarrage du serveur.
- [ ] Une Page nouvellement créée, ou jamais écrite, s'ouvre avec un éditeur vide, sans heading qui répète le titre.
- [ ] Passer d'une Page à une autre affiche le Contenu de la Page ouverte, sans reste de la précédente.
- [ ] Une Page dont on a effacé tout le Contenu reste vide après un rechargement.
- [ ] L'enregistrement part environ 1 s après la dernière frappe. Des frappes rapprochées ne donnent qu'un enregistrement.
- [ ] Ouvrir une Page sans la modifier n'enregistre rien.
- [ ] Il n'y a jamais deux enregistrements de la même Page en même temps. Un enregistrement ne peut pas en écraser un plus récent.
- [ ] L'enregistrement du Contenu ne revalide pas le layout : la sidebar ne recharge pas.
- [ ] Le serveur refuse un Contenu qui n'est pas un tableau ou qui dépasse 1 Mo, sans modifier la Page.
- [ ] Écrire dans une Page supprimée entre-temps donne une 404. Le Contenu d'une Page d'un autre utilisateur ou d'un autre Workspace que celui de l'adresse n'est ni lisible ni modifiable.
- [ ] Le Contenu ne change pas le titre, et le titre ne change pas le Contenu.
- [ ] Tests du module Pages écrits après l'implémentation (pas de TDD) :
  - Lecture :
    - tableau vide pour une Page jamais écrite, nouvellement créée ou recréée après suppression de la dernière ;
    - `null` pour une Page introuvable, avec le mauvais Workspace, ou d'un autre utilisateur.
  - Enregistrement :
    - Contenu relu à l'identique, Blocks imbriqués et propriétés arbitraires compris ;
    - un second enregistrement remplace le premier ;
    - un tableau vide est accepté ;
    - seule la Page visée est écrite ;
    - le titre et le Contenu sont indépendants ;
    - `false` sans rien modifier pour une Page introuvable, avec le mauvais Workspace, ou d'un autre utilisateur ;
    - erreur pour un Contenu qui n'est pas un tableau, et pour un Contenu de plus de 1 Mo, en laissant le Contenu précédent intact. Un Contenu juste sous la limite est accepté ;
    - persistance après réouverture de la base.
- [ ] Tests du planificateur avec de fausses horloges, écrits après l'implémentation :
  - rien ne part avant le délai ;
  - un seul enregistrement, avec le dernier Contenu, après des modifications rapprochées ;
  - aucun enregistrement concurrent ;
  - les modifications arrivées pendant un enregistrement partent ensemble à sa fin, avec le dernier Contenu ;
  - rien sans modification signalée.
