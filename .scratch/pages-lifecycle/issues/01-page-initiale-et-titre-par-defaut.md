# 01: Page initiale et Titre par défaut

**What to build:** Un Workspace contient toujours au moins une Page. À sa création, qu'il s'agisse du Workspace par défaut (première visite) ou d'un Workspace créé depuis la sidebar, une Page « New page » est créée à sa racine, dans la même transaction que le Workspace. « Create page » crée désormais aussi des Pages « New page » : le Titre par défaut remplace « Untitled ». Ouvrir l'adresse d'un Workspace redirige vers sa plus ancienne Page, après le contrôle d'accès. `/` et « Create workspace » arrivent donc directement sur une Page. La route du Workspace ne rend plus d'éditeur, et l'état vide « No pages yet » de la sidebar disparaît, puisqu'il ne peut plus se produire. Pas de migration : la base locale est supprimée et repart de zéro. Spec : `.scratch/pages-lifecycle/spec.md`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Le Workspace par défaut créé à la première visite contient exactement une Page « New page », à la racine
- [ ] Un Workspace créé depuis la sidebar contient exactement une Page « New page »
- [ ] La création du Workspace et de sa Page est atomique : jamais de Workspace sans Page
- [ ] Des appels concurrents à la création du Workspace par défaut, y compris depuis deux connexions, ne laissent qu'un Workspace et une Page
- [ ] « Create page » crée une Page intitulée « New page »
- [ ] Ouvrir `/[workspaceId]` redirige vers la plus ancienne Page du Workspace ; un Workspace introuvable ou d'un autre utilisateur donne toujours une 404
- [ ] `/` et « Create workspace » arrivent sur la Page « New page » du Workspace
- [ ] La route du Workspace ne rend plus d'éditeur, et le message « No pages yet » est retiré de la sidebar (« No pages found » du filtre reste)
- [ ] Tests des modules Workspaces et Pages écrits après l'implémentation (pas de TDD) : Page initiale pour `getOrCreateDefault` et `create`, unicité sous concurrence, isolation entre utilisateurs, « Untitled » remplacé par « New page », test « liste vide » retiré ou adapté, comptes de Pages ajustés
