# 04: Supprimer une Page depuis la sidebar

**What to build:** Chaque ligne de la liste des Pages de la sidebar porte une icône « Delete page », visible au survol et au focus clavier, avec un libellé accessible. Un clic supprime la Page immédiatement et définitivement, sans confirmation ni corbeille. Si c'était la dernière Page du Workspace, une Page « New page » est créée à la racine dans la même transaction, pour que le Workspace ne soit jamais vide. Si la Page supprimée est la Page ouverte, je suis amené sur la route du Workspace, qui redirige vers la plus ancienne Page restante (éventuellement la nouvelle « New page »). Sinon, je reste sur la Page ouverte et la sidebar se met à jour. Le bouton est désactivé pendant la suppression ; supprimer une Page déjà supprimée ne plante pas. On ne peut jamais supprimer une Page d'un Workspace qui n'est pas le sien. Le module Pages gagne une opération de suppression qui renvoie `true` si la Page a été supprimée, `false` pour une Page introuvable, d'un autre Workspace que celui donné ou d'un autre utilisateur (sans distinction). Spec : `.scratch/pages-lifecycle/spec.md`.

**Blocked by:** 01 (Page initiale et Titre par défaut)

**Status:** ready-for-agent

- [ ] Une icône « Delete page » apparaît au survol et au focus de chaque ligne de la liste des Pages
- [ ] Un clic supprime la Page sans confirmation ; elle disparaît de la sidebar et ne revient pas après un rechargement
- [ ] Supprimer la dernière Page d'un Workspace crée aussitôt une Page « New page », de façon atomique
- [ ] Supprimer la Page ouverte amène sur la plus ancienne Page restante, ou sur la nouvelle « New page » si c'était la dernière
- [ ] Supprimer une autre Page laisse sur la Page ouverte
- [ ] Le bouton est désactivé pendant la suppression : un double clic ne provoque pas d'erreur
- [ ] L'adresse d'une Page supprimée donne une 404
- [ ] Supprimer une Page d'un autre utilisateur ou d'un autre Workspace que celui de l'adresse ne supprime ni ne crée rien
- [ ] Tests du module Pages écrits après l'implémentation (pas de TDD) : `true` et disparition via `list` et `get`, suppression parmi plusieurs sans création, dernière Page remplacée par exactement une « New page » d'un autre identifiant, `false` pour Page déjà supprimée, introuvable, autre Workspace ou autre utilisateur, persistance après réouverture de la base
