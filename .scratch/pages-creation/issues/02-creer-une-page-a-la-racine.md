# 02: Créer une Page à la racine d'un Workspace

**What to build:** Dans l'onglet Pages de la sidebar, « Create page » crée immédiatement une Page « Untitled » à la racine du Workspace courant, sans formulaire, puis m'amène sur `/[workspaceId]/[pageId]`, qui affiche son titre en lecture seule. L'onglet liste les Pages du Workspace de la plus ancienne à la plus récente, avec le compteur, le filtre par titre et un état vide clair quand il n'y en a aucune. Mes Pages sont toujours là après un rechargement. Une Page demandée avec un mauvais Workspace, ou dans le Workspace d'un autre utilisateur, renvoie une 404 ; on ne peut jamais créer de Page dans le Workspace d'un autre. Le modèle porte un parent optionnel (toujours vide ici) pour les Sous-pages à venir. Éditeur, renommage et suppression de Page sont hors périmètre. Spec : `.scratch/pages-creation/spec.md`.

**Blocked by:** 01

**Status:** ready-for-agent

- [x] « Create page » crée une Page « Untitled » à la racine du Workspace courant et navigue vers sa route
- [x] La route de la Page affiche son titre en lecture seule
- [x] Les Pages sont listées de la plus ancienne à la plus récente, avec compteur sur l'onglet
- [x] Le filtre par titre restreint la liste
- [x] Un Workspace sans Page affiche un état vide clair
- [x] Les Pages sont toujours présentes après un rechargement
- [x] Une Page demandée avec le mauvais Workspace renvoie une 404
- [x] Lire, lister ou créer dans le Workspace d'un autre utilisateur est refusé (« introuvable »)
- [x] Le modèle permet un parent optionnel pour une Page
- [x] Tests du module écrits après l'implémentation (pas de TDD), contre une vraie base de test : création à la racine, titre « Untitled », ordre de création, accès croisé refusé

## Comments

**2026-10-13, implémentation.** Les cases cochées sont couvertes par `src/lib/pages.test.ts` (vraie base SQLite dans un fichier temporaire, vraies migrations). Les six cases non cochées sont implémentées (`src/app/[workspaceId]/actions.ts`, `src/app/[workspaceId]/[pageId]/page.tsx`, `src/components/SidebarPages.tsx`, `src/components/Sidebar.tsx`) et passent le typage et le build, mais restent à vérifier dans le navigateur avec une session connectée. Leur partie module est testée : création à la racine avec le titre « Untitled », ordre de la plus ancienne à la plus récente, « introuvable » pour une Page demandée avec le mauvais Workspace.

Deux choix non demandés par le ticket : la sidebar s'ouvre désormais sur l'onglet Pages (sinon un rechargement masque la liste derrière l'onglet « Spaces », encore factice jusqu'au ticket 03), et « Create page » est désactivé pendant la création pour qu'un double clic ne crée pas deux Pages.

La migration `0002_pages.sql` n'est appliquée qu'à l'ouverture de la base : redémarrer `next dev` après avoir récupéré ce changement.

**2026-10-13, vérification.** Thibaut a testé l'application à la main dans le navigateur après application de la migration ; les six cases restantes sont cochées sur cette base. Aucune vérification navigateur automatisée n'a eu lieu : l'inscription d'un compte de test bute sur le captcha de Clerk. La case « mauvais Workspace → 404 » ne peut pas être reproduite à la main tant qu'un utilisateur n'a qu'un seul Workspace (ticket 03) : elle repose sur le test du module (`get` renvoie « introuvable ») et sur la route qui transforme cette réponse en 404.
