# 05: Supprimer une Page avec confirmation

**What to build:** Je peux supprimer une Page. Avant, une confirmation m'indique combien de Sous-pages seront supprimées avec elle, et je peux annuler. Si je confirme, la Page et toute sa descendance sont supprimées définitivement (pas de corbeille en v1). Si je supprime la Page ouverte, je suis redirigé vers une Page valide, ou vers l'état vide s'il n'en reste aucune.

**Blocked by:** 04

**Status:** ready-for-agent

- [ ] Le module compte toute la descendance d'une Page, pas seulement ses enfants directs (test du module)
- [ ] Supprimer retire la Page et toute sa descendance, sans toucher aux autres Pages (test du module)
- [ ] La confirmation affiche le nombre de Sous-pages supprimées avec la Page
- [ ] Annuler à la confirmation ne supprime rien
- [ ] Supprimer la Page ouverte redirige vers une Page valide ou l'état vide
