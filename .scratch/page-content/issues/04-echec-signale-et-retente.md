# 04: Un enregistrement qui échoue est signalé et retenté

**What to build:** Tant que l'enregistrement fonctionne, je ne vois rien. Si un enregistrement échoue (serveur arrêté, Contenu de plus de 1 Mo refusé), un message discret, par exemple « Contenu non enregistré », apparaît près de l'éditeur. Mon texte reste affiché tel quel. Il n'y a pas de nouvelle tentative automatique en boucle : ma modification suivante relance un enregistrement normal, et le message disparaît dès qu'un enregistrement réussit. Si je ferme l'onglet alors que le dernier enregistrement a échoué, le navigateur m'avertit comme pour un enregistrement en attente.

Le planificateur gagne un état d'échec, avec une notification pour l'afficher. Après un échec, « non enregistré » reste vrai. Le cas de la Page supprimée entre-temps reste une 404, posée au ticket 01. Spec : `.scratch/page-content/spec.md`.

**Blocked by:** 01 (Le Contenu d'une Page est enregistré et relu), 03 (Fermer l'onglet ne fait jamais perdre de texte sans prévenir)

**Status:** ready-for-agent

- [ ] Rien n'est affiché quand les enregistrements réussissent.
- [ ] Un enregistrement qui échoue, serveur arrêté ou Contenu trop gros, affiche un message discret, et le texte reste dans l'éditeur.
- [ ] Aucune nouvelle tentative automatique : la modification suivante relance un enregistrement.
- [ ] Le message disparaît dès qu'un enregistrement réussit.
- [ ] Fermer l'onglet après un échec non rattrapé affiche l'avertissement natif.
- [ ] Une Page restée en échec garde son dernier Contenu tapé quand on la quitte et qu'on y revient.
- [ ] Tests du planificateur écrits après l'implémentation :
  - un échec passe en état d'échec et le notifie, sans nouvelle tentative seul ;
  - « non enregistré » reste vrai après un échec ;
  - la modification suivante relance un enregistrement ;
  - sa réussite efface l'état d'échec.
