# Vision

Un clone de Notion : un espace de prise de notes organisé en pages imbriquées, dont le contenu est un document de blocs.

## Language

**Workspace**:
L'espace racine qui contient toutes les Pages d'un utilisateur.
_Avoid_: Compte, espace de travail

**Page**:
Un document identifié, avec un titre, positionné dans l'arbre sous un Workspace ou sous une autre Page.
_Avoid_: Note, document

**Sous-page**:
Une Page dont le parent est une autre Page.
_Avoid_: Page enfant, dossier

**Block**:
Une unité de contenu d'une Page, au sens de BlockNote (texte, titre, liste, to-do, code). Le contenu d'une Page est le document de Blocks produit par BlockNote.
_Avoid_: Élément, section, nœud
