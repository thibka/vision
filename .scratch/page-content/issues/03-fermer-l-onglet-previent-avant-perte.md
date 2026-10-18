# 03: Fermer l'onglet ne fait jamais perdre de texte sans prévenir

**What to build:** Si je ferme ou recharge l'onglet juste après avoir tapé, alors qu'un enregistrement est en attente ou en cours, l'enregistrement est tenté immédiatement et le navigateur affiche son avertissement natif (« Les modifications pourraient ne pas être enregistrées »). Le navigateur peut couper la requête : l'avertissement est le filet de sécurité qui rend toute perte visible. Quand tout est enregistré, rien ne m'avertit et l'onglet se ferme normalement.

Le planificateur gagne « quelque chose n'est pas enregistré ? ». C'est vrai pendant le délai et pendant un enregistrement en cours, et faux une fois tout enregistré. L'éditeur s'en sert pour activer l'avertissement à la fermeture, et déclenche « enregistrer maintenant » quand l'onglet se ferme. Spec : `.scratch/page-content/spec.md`.

**Blocked by:** 01 (Le Contenu d'une Page est enregistré et relu)

**Status:** ready-for-agent

- [ ] Fermer ou recharger l'onglet pendant le délai ou pendant un enregistrement en cours affiche l'avertissement natif du navigateur.
- [ ] Fermer ou recharger l'onglet quand tout est enregistré n'affiche aucun avertissement.
- [ ] À la fermeture, ce qui est en attente est envoyé immédiatement. Après un rechargement accepté, on retrouve ce qui avait été tapé, dans la mesure où le navigateur a laissé passer la requête.
- [ ] Tests du planificateur écrits après l'implémentation : « non enregistré » est vrai pendant le délai et pendant un enregistrement en cours, et faux une fois tout enregistré ou sans modification.
