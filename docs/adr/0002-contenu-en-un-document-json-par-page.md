# 0002 : Le Contenu est stocké en un seul document JSON par Page

**Statut :** accepté (2026-10-18)

Le Contenu d'une Page est enregistré tel que BlockNote le produit, sérialisé en JSON dans une colonne `content` de la table `pages`, à `NULL` tant que la Page n'a jamais été écrite. Le serveur vérifie seulement que c'est un tableau JSON de taille bornée, sans valider le schéma BlockNote, pour ne pas se coupler à sa version.

## Alternatives écartées

- **Un Block par ligne en base** : permettrait la recherche, les liens et les modifications au niveau du Block, mais demande de traduire l'arbre de Blocks en lignes et de calculer les différences à chaque enregistrement. Repoussé après la v1 (voir `docs/backlog.md`).
- **Une table séparée pour le Contenu** : n'apporte rien tant que le Contenu se lit Page par Page, la liste de la sidebar ne sélectionnant pas cette colonne.

## Conséquences

- Chaque enregistrement réécrit le Contenu entier de la Page. Entre deux onglets ouverts sur la même Page, le dernier enregistrement gagne.
- Passer plus tard à un Block par ligne demandera une migration des documents existants.
