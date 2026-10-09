# 01: Socle : persistance et Workspace par défaut

**What to build:** À ma première visite authentifiée, un Workspace par défaut est créé pour moi, nommé « <Prénom>'s workspace » d'après mon prénom Clerk, ou « Workspace 1 » si le prénom est absent ou vide. `/` me redirige vers `/[workspaceId]`, et le haut de la sidebar affiche le nom du Workspace courant à la place de « Nimbus ». Revenir sur l'application ne crée jamais de doublon, même sous deux requêtes concurrentes. Le nom est copié à la création et ne suit pas les changements de profil. Un Workspace inexistant ou appartenant à un autre utilisateur renvoie une 404, sans distinction. Ce ticket pose le socle : le stockage persistant (qui doit survivre à un redémarrage) et le module Workspaces, dont l'interface serveur prend l'identifiant utilisateur en entrée. Le modèle supporte N Workspaces par utilisateur. Lire `node_modules/next/dist/docs/` avant d'écrire du code (AGENTS.md). Spec : `.scratch/pages-creation/spec.md`.

**Blocked by:** None. La persistance est tranchée : SQLite via `better-sqlite3`, voir `docs/adr/0001-sqlite-via-better-sqlite3.md`.

**Status:** ready-for-agent

- [x] Un utilisateur sans Workspace obtient un Workspace par défaut à sa première visite authentifiée
- [x] Le nom vaut « Thibaut's workspace » pour un prénom renseigné, et « Workspace 1 » pour un prénom vide ou absent
- [x] Deux appels successifs ou concurrents ne créent qu'un seul Workspace
- [x] Le nom ne change pas quand le profil Clerk change
- [ ] `/` redirige vers `/[workspaceId]`
- [ ] Le nom du Workspace courant remplace « Nimbus » en haut de la sidebar
- [ ] Un Workspace inexistant ou d'un autre utilisateur renvoie une 404
- [x] Les Workspaces survivent à un redémarrage de l'application
- [x] Le modèle permet plusieurs Workspaces par utilisateur
- [x] Tests du module écrits après l'implémentation (pas de TDD, voir AGENTS.md), contre une vraie base de test, sans mock

## Comments

**2026-10-08, implémentation.** Les cases cochées sont couvertes par `src/lib/workspaces.test.ts` (vraie base SQLite dans un fichier temporaire). Les trois cases non cochées sont implémentées (`src/app/page.tsx`, `src/app/[workspaceId]/`, `src/components/Sidebar.tsx`) et passent le typage et le build, mais restent à vérifier dans le navigateur avec une session connectée. Le refus d'accès lui-même (« introuvable » pour un Workspace inexistant ou d'un autre utilisateur) est testé au niveau du module.
