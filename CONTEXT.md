# Vision

Un clone de Notion : un espace de prise de notes organisé en pages imbriquées, dont le contenu est un document de blocs.

## Language

**Workspace**:
Un conteneur de Pages appartenant à un utilisateur. Un utilisateur a toujours au moins un Workspace, et peut en avoir plusieurs. Un Workspace est renommable ; il ne peut être supprimé que s'il en reste un autre.
_Avoid_: Space, Espace, Compte, espace de travail

**Workspace par défaut**:
Le premier Workspace d'un utilisateur, créé à sa première visite authentifiée. Nommé « <Prénom>'s workspace » d'après le prénom de l'utilisateur, ou « Workspace 1 » si le prénom est absent ou vide. Le nom est copié à la création et ne suit pas les changements de profil.

**Workspace courant**:
Le Workspace affiché à l'écran, identifié par l'URL. Son nom s'affiche en haut de la sidebar.

**Page**:
Un document identifié, avec un titre, positionné dans l'arbre sous un Workspace ou sous une autre Page.
_Avoid_: Note, document

**Sous-page**:
Une Page dont le parent est une autre Page.
_Avoid_: Page enfant, dossier

**Block**:
Une unité de contenu d'une Page, au sens de BlockNote (texte, titre, liste, to-do, code). Le contenu d'une Page est le document de Blocks produit par BlockNote.
_Avoid_: Élément, section, nœud
