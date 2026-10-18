# 01: Créer un Workspace depuis la sidebar

**What to build:** Dans l'onglet « Workspaces » de la sidebar, le bouton « Create workspace » réapparaît en pied d'onglet. Un clic crée immédiatement un Workspace, sans formulaire, avec le Nom par défaut : « <Prénom>'s workspace », ou « My workspace » si le prénom est absent ou vide. Le prénom est lu dans Clerk au moment de la création. Je suis ensuite amené sur `/[workspaceId]` du nouveau Workspace, qui apparaît en dernier dans la liste. Les noms en double sont permis et le nombre de Workspaces n'est pas limité. Le nom de repli du Workspace par défaut passe aussi de « Workspace 1 » à « My workspace », sans migration des Workspaces existants. `/` redirige toujours vers le premier Workspace créé. Le renommage et la suppression sont hors périmètre. Spec : `.scratch/workspaces-creation/spec.md`.

**Blocked by:** None

**Status:** ready-for-agent

- [ ] Le bouton « Create workspace » est visible en pied de l'onglet « Workspaces »
- [ ] Un clic crée un Workspace et navigue vers `/[workspaceId]` du nouveau Workspace
- [ ] Le nouveau Workspace s'appelle « <Prénom>'s workspace », ou « My workspace » sans prénom
- [ ] Le nouveau Workspace apparaît en dernier dans la liste, mis en évidence, et le compteur augmente
- [ ] Le bouton est désactivé pendant la création : un double clic ne crée qu'un Workspace
- [ ] Le Workspace par défaut d'un utilisateur sans prénom s'appelle « My workspace »
- [ ] `/` redirige toujours vers le premier Workspace créé
- [ ] Tests du module (création, nommage, doublons, ordre, isolation entre utilisateurs, persistance, « Workspace 1 » remplacé par « My workspace ») écrits après l'implémentation (pas de TDD)
