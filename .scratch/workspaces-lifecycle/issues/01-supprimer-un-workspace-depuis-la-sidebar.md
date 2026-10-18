# 01: Supprimer un Workspace depuis la sidebar

**What to build:** Chaque ligne de la liste des Workspaces de la sidebar porte une icône « Delete workspace », visible au survol et au focus clavier, avec un libellé accessible, sur le modèle de « Delete page ». L'icône n'est rendue que si l'utilisateur a au moins deux Workspaces, quel que soit le filtre. Un clic ouvre la confirmation native du navigateur, qui nomme le Workspace et prévient que ses Pages seront supprimées ; si l'utilisateur annule, rien n'est envoyé. Une fois la suppression confirmée, le Workspace et toutes ses Pages sont supprimés définitivement, dans une même transaction `immediate` qui vérifie qu'il reste un autre Workspace. Si c'était le Workspace courant, l'utilisateur est redirigé vers `/`, c'est-à-dire vers le plus ancien Workspace restant et sa plus ancienne Page ; sinon, il reste où il est et la sidebar se met à jour. Le bouton est désactivé pendant la suppression ; supprimer un Workspace déjà supprimé ne plante pas. Le module Workspaces gagne une opération de suppression qui renvoie `true` si le Workspace a été supprimé, `false` (sans distinction) pour un Workspace introuvable, celui d'un autre utilisateur ou le dernier de l'utilisateur. Pas de changement de schéma. Spec : `.scratch/workspaces-lifecycle/spec.md`.

**Status:** ready-for-agent

- [ ] Une icône « Delete workspace » apparaît au survol et au focus de chaque ligne de la liste des Workspaces
- [ ] L'icône n'apparaît pas quand l'utilisateur n'a qu'un Workspace, et reste disponible quand le filtre n'en affiche qu'un parmi plusieurs
- [ ] Un clic demande une confirmation native ; annuler ne supprime rien
- [ ] Confirmer supprime le Workspace et toutes ses Pages, Sous-pages comprises ; il disparaît de la sidebar et ne revient pas après un rechargement
- [ ] Supprimer le Workspace courant amène sur le plus ancien Workspace restant, sur sa plus ancienne Page
- [ ] Supprimer un autre Workspace laisse sur la Page ouverte, et le compteur de l'onglet « Workspaces » diminue
- [ ] Le bouton est désactivé pendant la suppression : un double clic ne provoque pas d'erreur
- [ ] L'adresse d'un Workspace supprimé, ou d'une de ses Pages, donne une 404
- [ ] Supprimer le dernier Workspace, ou celui d'un autre utilisateur, ne supprime rien
- [ ] Tests du module Workspaces écrits après l'implémentation (pas de TDD) : `true` et disparition via `list` et `get` ; Pages et Sous-pages du Workspace supprimé illisibles, `list` des Pages à `null` ; autres Workspaces intacts ; `false` pour le dernier Workspace, pour un Workspace déjà supprimé ou introuvable, et pour celui d'un autre utilisateur ; premier Workspace supprimable, après quoi « obtenir ou créer le Workspace par défaut » renvoie le plus ancien restant sans en créer ; persistance après réouverture de la base
