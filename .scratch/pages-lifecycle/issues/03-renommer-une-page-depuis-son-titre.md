# 03: Renommer une Page depuis son titre

**What to build:** Je clique sur le h1 d'une Page pour modifier son titre sur place. Entrée, la sortie du champ (blur) et Échap valident tous les trois, comme dans Notion : il n'y a pas d'annulation. Le titre est enregistré tout de suite, survit à un rechargement, et la liste des Pages de la sidebar se met à jour (le filtre trouve la Page par son nouveau titre). Les espaces en début et en fin de titre sont retirés, et un titre vidé redevient le Titre par défaut, « New page ». La saisie est bloquée au-delà de 200 caractères, et le serveur refuse lui aussi un titre plus long. On ne peut jamais renommer une Page d'un Workspace qui n'est pas le sien. Le module Pages gagne une opération de renommage : elle renvoie la Page renommée, `null` pour une Page introuvable, d'un autre Workspace que celui donné ou d'un autre utilisateur (sans distinction), et lève une erreur au-delà de 200 caractères (comptés en caractères, après trim). Valider un titre inchangé n'appelle pas le serveur. Spec : `.scratch/pages-lifecycle/spec.md`.

**Blocked by:** 01 (Page initiale et Titre par défaut), 02 (Éditeur sous le titre de chaque Page)

**Status:** ready-for-agent

- [ ] Le h1 d'une Page est éditable sur place, dans un style de titre
- [ ] Entrée, blur et Échap enregistrent le titre
- [ ] Le nouveau titre apparaît dans la sidebar et après un rechargement
- [ ] Les espaces en début et en fin de titre sont retirés ; un titre vide ou fait d'espaces devient « New page »
- [ ] La saisie est bloquée au-delà de 200 caractères ; le serveur refuse un titre de 201 caractères sans modifier la Page
- [ ] Valider un titre inchangé n'envoie rien au serveur
- [ ] Renommer une Page d'un autre utilisateur ou d'un autre Workspace que celui de l'adresse ne modifie rien
- [ ] Tests du module Pages écrits après l'implémentation (pas de TDD) : titre renvoyé et visible via `get` et `list`, trim, titre vide → « New page », 200 caractères acceptés et 201 refusés, `null` pour Page introuvable, autre Workspace ou autre utilisateur, persistance après réouverture de la base
