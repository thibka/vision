# 02: Ouvrir une Page et éditer son contenu

**What to build:** Je clique sur une Page dans la sidebar et elle s'ouvre dans un éditeur BlockNote (texte, titres, listes, to-do, code, menu « / »). La Page ouverte est mise en évidence dans la sidebar. Mon contenu est sauvegardé automatiquement, après une courte inactivité en frappe et au changement de Page, et je le retrouve à l'identique après rechargement. Chaque Page a sa propre route, identifiée par son id. Une Page inexistante (lien obsolète) affiche un message clair. Le contenu est le document JSON de BlockNote, stocké tel quel dans une colonne, traité comme opaque par le module Pages.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Cliquer une Page dans la sidebar l'ouvre dans BlockNote, à une URL propre à cette Page
- [ ] La Page ouverte est mise en évidence dans la sidebar
- [ ] Le contenu est sauvegardé automatiquement (après inactivité et au changement de Page)
- [ ] Le contenu relu après rechargement est identique à celui saisi (test du module)
- [ ] Lire ou ouvrir une Page inexistante donne une erreur explicite / un message clair, pas une erreur brute
