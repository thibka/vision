# 0001 : Persistance en SQLite via better-sqlite3

**Statut :** accepté (2026-10-08)

## Contexte

Les Workspaces et les Pages doivent survivre à un redémarrage de l'application. Les données sont personnelles à chaque utilisateur Clerk. L'application tourne en local, sur un seul processus Node ; le déploiement public est hors périmètre. Les tests du module doivent s'exécuter contre une vraie base, sans mock.

## Décision

Les données sont stockées dans un fichier SQLite local, lu et écrit avec `better-sqlite3`, en SQL brut et sans ORM.

- Le fichier est `data/vision.db` par défaut, ignoré par git. La variable `DATABASE_PATH` permet d'en changer.
- Le schéma est versionné par des fichiers `.sql` écrits à la main dans `migrations/`, appliqués dans l'ordre des noms à l'ouverture de la base, une seule fois chacun.
- Seuls `src/lib/db.ts` et les modules métier (`src/lib/workspaces.ts`) touchent à la base. Les routes et la sidebar passent par ces modules.
- L'interface des modules métier est asynchrone, bien que le pilote soit synchrone, pour que les appelants ne dépendent pas du pilote.

## Alternatives écartées

- **`node:sqlite`** (module natif de Node) : aucune dépendance, mais encore expérimental. Sur Node 23.3 il exige le flag `--experimental-sqlite` dans tous les scripts.
- **Postgres** : adapté à un déploiement multi-instance, mais demande un service à faire tourner, une base de test dédiée et un verrou explicite pour l'unicité du Workspace par défaut. Trop lourd tant que l'application reste locale.

## Conséquences

- `better-sqlite3` est une dépendance native. La version est fixée sur la branche 12.x : la 13 exige N-API 10 et plante (segfault) sur Node 23.3, la version utilisée en local. Passer à Node 24 permettra de monter en 13. Le binaire dépend de la version de Node : après un changement de Node, relancer `npm install`.
- L'unicité du Workspace par défaut repose sur une transaction `BEGIN IMMEDIATE` qui relit avant d'insérer, et non sur une contrainte d'unicité, puisqu'un utilisateur peut avoir plusieurs Workspaces.
- Un fichier local ne convient pas à un hébergement serverless ou multi-instance. Cette décision sera à rouvrir avant un déploiement public ; le changement restera cantonné à `src/lib/db.ts` et aux modules métier.
