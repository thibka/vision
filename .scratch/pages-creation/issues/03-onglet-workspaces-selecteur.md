# 03: L'onglet « Workspaces » sert de sélecteur

**What to build:** L'onglet « Spaces » de la sidebar devient « Workspaces ». Il liste mes Workspaces avec leur compteur et un filtre par nom, met en évidence le Workspace courant, et un clic sur un Workspace navigue vers `/[workspaceId]`. Le bouton « Create workspace » est masqué ou inactif, car la création est hors périmètre. Pour l'instant la liste ne contient qu'un élément, mais elle doit fonctionner avec plusieurs. Spec : `.scratch/pages-creation/spec.md`.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] L'onglet s'appelle « Workspaces » et affiche le nombre de Workspaces
- [ ] La liste montre tous mes Workspaces, et seulement les miens
- [ ] Le Workspace courant est mis en évidence
- [ ] Un clic sur un Workspace navigue vers `/[workspaceId]`
- [ ] Le filtre restreint la liste par nom
- [ ] « Create workspace » est masqué ou inactif
- [ ] Tests du module (liste des Workspaces d'un utilisateur, isolation entre utilisateurs) écrits après l'implémentation (pas de TDD)
