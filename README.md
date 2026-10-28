# Vision

**Vision** est un clone personnel de [Notion](https://www.notion.com) : des **Workspaces** qui contiennent des **Pages** imbriquées (à terme), chacune avec un **Contenu** éditable sous forme de blocs (texte, listes, to-do, code, tableaux, médias par URL, etc.).

Le projet est en développement actif. La **v1** vise une application **locale**, **mono-utilisateur** (compte personnel via Clerk), avec persistance sur disque. Le dépôt est public pour documenter l’intention, le modèle métier et la feuille de route ; il n’y a pas encore d’instance hébergée pour le grand public.

- Dépôt : [github.com/thibka/vision](https://github.com/thibka/vision)
- Licence : [MIT](LICENSE)

## État actuel

Fonctionnalités déjà en place :

| Domaine | Comportement |
| --- | --- |
| **Authentification** | Connexion et inscription via [Clerk](https://clerk.com) ; les routes protégées refusent l’accès aux visiteurs non connectés. |
| **Workspaces** | Création automatique d’un workspace par défaut à la première visite ; plusieurs workspaces par utilisateur ; renommage, icône (emoji ou initiale), suppression si au moins un autre workspace reste. |
| **Pages** | Création à la **racine** du workspace courant, liste et filtre dans la sidebar, renommage depuis le titre de la page, suppression (le workspace garde toujours au moins une page). |
| **Contenu** | Éditeur [BlockNote](https://www.blocknotejs.org/) avec enregistrement automatique (~1 s après la dernière frappe), relecture après rechargement ; document JSON par page ([ADR 0002](docs/adr/0002-contenu-en-un-document-json-par-page.md)). |
| **Navigation** | URL `/{workspaceId}` et `/{workspaceId}/{pageId}` ; `/` redirige vers le workspace par défaut de l’utilisateur. |
| **Données** | SQLite locale (`data/vision.db` par défaut) via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) ([ADR 0001](docs/adr/0001-sqlite-via-better-sqlite3.md)). |

Limites connues de la v1 en cours : pas encore d’arbre de **sous-pages** dans l’interface (le schéma le prévoit), pas de collaboration, pas de déploiement public. Le vocabulaire métier (Workspace, Page, Contenu, Block…) est défini dans [`CONTEXT.md`](CONTEXT.md).

## Stack

- [Next.js](https://nextjs.org) 16 (App Router), React 19
- TypeScript, [Tailwind CSS](https://tailwindcss.com) 4
- [Mantine](https://mantine.dev/) (UI autour de BlockNote)
- Tests : [Vitest](https://vitest.dev/)

## Développement local

**Prérequis :** Node.js (le projet utilise des binaires natifs pour `better-sqlite3` ; après un changement de version de Node, relancer `npm install`).

```bash
git clone https://github.com/thibka/vision.git
cd vision
npm install
```

Créer un fichier `.env.local` à la racine avec les clés d’une application Clerk (tableau de bord Clerk → API Keys) :

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

Optionnel : `DATABASE_PATH` pour pointer vers un autre fichier SQLite (sinon `data/vision.db`, ignoré par git).

Lancer le serveur de développement (port **8000**) :

```bash
npm run dev
```

Ouvrir [http://localhost:8000](http://localhost:8000). Lancer les tests :

```bash
npm test
```

Autres scripts : `npm run build`, `npm run serve:build`, `npm run lint`.

## Documentation

| Fichier | Rôle |
| --- | --- |
| [`CONTEXT.md`](CONTEXT.md) | Glossaire et règles métier (langage du produit). |
| [`docs/backlog.md`](docs/backlog.md) | Backlog **hors v1** (liste de référence). |
| [`docs/adr/`](docs/adr/) | Décisions d’architecture. |
| [`docs/agents/issue-tracker.md`](docs/agents/issue-tracker.md) | Suivi des specs et tickets sur les [issues GitHub](https://github.com/thibka/vision/issues). |

Les anciens tickets archivés avant le passage à GitHub sont en lecture seule sous `.scratch/`.

## Backlog (après la v1)

Évolutions prévues une fois le socle v1 stabilisé — détail et mises à jour dans [`docs/backlog.md`](docs/backlog.md) :

- Bases de données (tables, kanban, calendrier)
- Multi-utilisateur, workspaces partagés
- Collaboration temps réel
- Corbeille avec restauration
- Lien de sous-page dans le contenu (bloc BlockNote personnalisé)
- Stockage Block par ligne en base
- Upload de fichiers pour les blocs médias (image, vidéo, audio, fichier)
- Indicateur d’enregistrement du contenu
- Recherche
- Icônes et couvertures de page
- Export
- Mode sombre
- Raccourcis clavier globaux
- Déplacement de pages (changement de parent ou d’ordre, refus des cycles)
- Drag & drop dans la sidebar
- Redirection de `/` vers le dernier workspace visité
- Déploiement public (après authentification et hébergement adaptés)

Les nouvelles specs et tâches d’implémentation sont publiées comme issues sur [thibka/vision](https://github.com/thibka/vision) (label `spec`, triage via les labels décrits dans [`docs/agents/triage-labels.md`](docs/agents/triage-labels.md)).

## Contribuer

Le projet est principalement conduit en solo pour l’instant. Les issues ouvertes et le backlog documentent la direction ; les retours et discussions passent par GitHub Issues.
