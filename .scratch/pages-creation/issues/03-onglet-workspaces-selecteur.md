# 03: L'onglet « Workspaces » sert de sélecteur

**What to build:** L'onglet « Spaces » de la sidebar devient « Workspaces ». Il liste mes Workspaces avec leur compteur et un filtre par nom, met en évidence le Workspace courant, et un clic sur un Workspace navigue vers `/[workspaceId]`. Le bouton « Create workspace » est masqué ou inactif, car la création est hors périmètre. Pour l'instant la liste ne contient qu'un élément, mais elle doit fonctionner avec plusieurs. Spec : `.scratch/pages-creation/spec.md`.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] L'onglet s'appelle « Workspaces » et affiche le nombre de Workspaces
- [x] La liste montre tous mes Workspaces, et seulement les miens
- [ ] Le Workspace courant est mis en évidence
- [ ] Un clic sur un Workspace navigue vers `/[workspaceId]`
- [ ] Le filtre restreint la liste par nom
- [ ] « Create workspace » est masqué ou inactif
- [x] Tests du module (liste des Workspaces d'un utilisateur, isolation entre utilisateurs) écrits après l'implémentation (pas de TDD)

## Comments

**2026-10-17, implémentation.** Les cases cochées sont couvertes par `src/lib/workspaces.test.ts` : `list` renvoie tous les Workspaces de l'utilisateur, du plus ancien au plus récent, et seulement les siens (vraie base SQLite, vraies migrations). Les cinq cases non cochées sont implémentées (`src/components/SidebarWorkspaces.tsx`, `src/components/Sidebar.tsx`, `src/app/[workspaceId]/layout.tsx`) et passent le typage, le lint et le build, mais restent à vérifier dans le navigateur avec une session connectée.

« Create workspace » est masqué : le pied d'onglet est supprimé. Le Workspace courant porte `aria-current="page"` et un fond. Le filtre vide affiche « No workspaces found. ». Pas d'état « aucun Workspace » : un utilisateur en a toujours au moins un. Pour vérifier à la main avec plusieurs Workspaces, il faut en insérer un second directement en base, car aucune opération ne permet d'en créer.
