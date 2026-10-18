# 02: Éditeur sous le titre de chaque Page

**What to build:** En ouvrant une Page, je vois son titre dans un h1, en lecture seule pour l'instant, et en dessous un éditeur de Blocks BlockNote réel, prêt à écrire. Le composant d'éditeur, aujourd'hui en chantier (il rend un texte de remplacement), affiche réellement BlockNote. Il démarre avec un document vide, sans heading « New page » injecté, pour ne pas répéter le titre. Le contenu n'est pas sauvegardé : il est perdu au rechargement. Spec : `.scratch/pages-lifecycle/spec.md`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] La route d'une Page affiche le titre dans un h1, suivi de l'éditeur BlockNote
- [ ] L'éditeur est utilisable : on peut y saisir du texte et des Blocks
- [ ] L'éditeur démarre vide, sans heading qui répète le titre
- [ ] Le texte de remplacement du composant d'éditeur a disparu
- [ ] Une Page d'un autre Workspace ou d'un autre utilisateur donne toujours une 404
- [ ] Pas de test automatisé : aucun seam testé n'est touché
