# 02: Créer une Page à la racine d'un Workspace

**What to build:** Dans l'onglet Pages de la sidebar, « Create page » crée immédiatement une Page « Untitled » à la racine du Workspace courant, sans formulaire, puis m'amène sur `/[workspaceId]/[pageId]`, qui affiche son titre en lecture seule. L'onglet liste les Pages du Workspace de la plus ancienne à la plus récente, avec le compteur, le filtre par titre et un état vide clair quand il n'y en a aucune. Mes Pages sont toujours là après un rechargement. Une Page demandée avec un mauvais Workspace, ou dans le Workspace d'un autre utilisateur, renvoie une 404 ; on ne peut jamais créer de Page dans le Workspace d'un autre. Le modèle porte un parent optionnel (toujours vide ici) pour les Sous-pages à venir. Éditeur, renommage et suppression de Page sont hors périmètre. Spec : `.scratch/pages-creation/spec.md`.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] « Create page » crée une Page « Untitled » à la racine du Workspace courant et navigue vers sa route
- [ ] La route de la Page affiche son titre en lecture seule
- [ ] Les Pages sont listées de la plus ancienne à la plus récente, avec compteur sur l'onglet
- [ ] Le filtre par titre restreint la liste
- [ ] Un Workspace sans Page affiche un état vide clair
- [ ] Les Pages sont toujours présentes après un rechargement
- [ ] Une Page demandée avec le mauvais Workspace renvoie une 404
- [ ] Lire, lister ou créer dans le Workspace d'un autre utilisateur est refusé (« introuvable »)
- [ ] Le modèle permet un parent optionnel pour une Page
- [ ] Tests du module écrits après l'implémentation (pas de TDD), contre une vraie base de test : création à la racine, titre « Untitled », ordre de création, accès croisé refusé
