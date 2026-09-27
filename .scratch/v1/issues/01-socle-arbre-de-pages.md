# 01: Socle : créer une Page et voir l'arbre

**What to build:** Depuis la sidebar, je peux créer une Page à la racine du Workspace et la voir apparaître dans l'arbre, à la fin de ses sœurs. Quand le Workspace n'a aucune Page, un état vide m'explique comment démarrer. Après un redémarrage de l'app, mes Pages sont toujours là. Ce ticket pose le socle : le framework de test, la persistance SQLite avec Drizzle et ses migrations (fichier de base local, ignoré par git), le module Pages limité à « créer une Page » et « lire l'arbre », et le remplacement de la sidebar maquette par une sidebar réelle. Un seul Workspace existe, créé à la volée. Lire `node_modules/next/dist/docs/` avant d'écrire du code (AGENTS.md).

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Un framework de test est en place et les tests du module Pages tournent contre un SQLite en mémoire avec le vrai schéma
- [ ] Une Page créée apparaît dans l'arbre lu, sous son parent, à la fin de ses sœurs (test du module)
- [ ] Créer une Page à la racine depuis la sidebar l'affiche dans l'arbre
- [ ] Un Workspace sans Page affiche un état vide clair
- [ ] Les Pages créées sont toujours présentes après redémarrage de l'app
- [ ] Le fichier de base de données est ignoré par git
- [ ] L'ancienne sidebar maquette est remplacée
