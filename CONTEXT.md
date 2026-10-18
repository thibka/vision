# Vision

Un clone de Notion : un espace de prise de notes organisé en pages imbriquées, dont le contenu est un document de blocs.

## Language

**Workspace**:
Un conteneur de Pages appartenant à un utilisateur. Un utilisateur a toujours au moins un Workspace, et peut en avoir plusieurs. Un Workspace est renommable ; il ne peut être supprimé que s'il en reste un autre, et sa suppression supprime définitivement toutes ses Pages. Plusieurs Workspaces peuvent porter le même nom.
_Avoid_: Space, Espace, Compte, espace de travail

**Nom par défaut**:
Le nom que reçoit tout Workspace à sa création : « <Prénom>'s workspace » d'après le prénom de l'utilisateur, ou « My workspace » si le prénom est absent ou vide. Le prénom est lu au moment de la création ; le nom est copié et ne suit pas les changements de profil.

**Workspace par défaut**:
Le premier Workspace d'un utilisateur, créé automatiquement à sa première visite authentifiée. Il porte le Nom par défaut. Ce statut ne vaut qu'à sa création : il est ensuite un Workspace ordinaire, supprimable comme les autres.

**Workspace courant**:
Le Workspace affiché à l'écran, identifié par l'URL. Son nom s'affiche en haut de la sidebar.

**Page**:
Un document identifié, avec un titre, positionné dans l'arbre sous un Workspace ou sous une autre Page. Une Page est renommable, et plusieurs Pages peuvent porter le même titre. Un Workspace contient toujours au moins une Page : sa création s'accompagne de celle d'une Page, et supprimer sa dernière Page en recrée une.
_Avoid_: Note, document

**Titre par défaut**:
Le titre que reçoit toute Page à sa création, qu'elle soit créée par l'utilisateur ou automatiquement : « New page ». Une Page renommée avec un titre vide reprend le Titre par défaut.

**Sous-page**:
Une Page dont le parent est une autre Page.
_Avoid_: Page enfant, dossier

**Contenu**:
Le document de Blocks d'une Page, affiché sous son titre. Une Page créée a un Contenu vide. Le Contenu est durable : on le retrouve tel qu'on l'a laissé en revenant sur la Page, y compris après un rechargement.
_Avoid_: Corps, body, document

**Block**:
Une unité du Contenu d'une Page, au sens de BlockNote : par exemple texte, titre, liste, to-do, code, tableau, ou média intégré par URL.
_Avoid_: Élément, section, nœud
