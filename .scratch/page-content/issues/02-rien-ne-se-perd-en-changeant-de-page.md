# 02: Rien ne se perd en changeant de Page

**What to build:** Je tape dans une Page puis je clique aussitôt sur une autre Page de la sidebar, sans attendre la seconde de délai. Ce qui n'était pas encore enregistré part immédiatement, et la navigation est instantanée : elle n'attend jamais la fin de l'enregistrement. Si je reviens tout de suite sur la première Page, alors que son enregistrement n'est peut-être pas terminé, l'éditeur affiche le dernier Contenu que j'ai tapé, jamais une version antérieure. Je peux continuer à écrire, et mes nouvelles modifications passent après l'enregistrement en cours.

Le planificateur gagne « enregistrer maintenant » :
- il envoie tout de suite ce qui est en attente ;
- il ne fait rien s'il n'y a rien en attente ;
- l'enregistrement différé ne repart pas ensuite.

Les planificateurs vivent dans un registre côté client, indexé par Page, qui survit au démontage de l'éditeur :
- un planificateur reste dans le registre tant que quelque chose n'est pas enregistré, puis en est retiré ;
- à l'ouverture d'une Page encore présente dans le registre, l'éditeur part du dernier Contenu signalé plutôt que de celui venu du serveur, et reprend ce même planificateur.

Spec : `.scratch/page-content/spec.md`.

**Blocked by:** 01 (Le Contenu d'une Page est enregistré et relu)

**Status:** ready-for-agent

- [ ] Ce qui est tapé juste avant de cliquer sur une autre Page est enregistré : on le retrouve après un rechargement.
- [ ] Le changement de Page n'attend pas la fin de l'enregistrement.
- [ ] Revenir sur une Page juste après l'avoir quittée affiche le dernier Contenu tapé, même si son enregistrement n'était pas terminé.
- [ ] Les modifications faites après ce retour sont enregistrées après l'enregistrement en cours, jamais avant, et c'est la dernière version qui reste.
- [ ] Une Page quittée sans modification n'envoie rien au serveur.
- [ ] Une fois tout enregistré, une Page rouverte part du Contenu venu du serveur.
- [ ] Tests du planificateur écrits après l'implémentation :
  - « enregistrer maintenant » envoie tout de suite ce qui est en attente, et l'enregistrement différé ne repart pas ;
  - il ne fait rien sans modification en attente ;
  - pendant un enregistrement en cours, il ne lance pas d'enregistrement concurrent.
