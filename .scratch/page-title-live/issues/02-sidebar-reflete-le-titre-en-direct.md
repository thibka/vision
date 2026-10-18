# 02: La sidebar reflète le titre de la Page ouverte pendant la frappe

**What to build:** Pendant que je tape le titre d'une Page, sa ligne dans la sidebar affiche le titre à chaque frappe, sous sa forme normalisée : espaces de début et de fin retirés, et Titre par défaut « New page » si le titre est vide ou ne contient que des espaces. La normalisation passe par la règle partagée du module de titre de Page. Le filtre de la sidebar s'applique à ce titre affiché en direct : la ligne disparaît de la liste filtrée quand elle ne correspond plus, et revient quand elle correspond de nouveau. Les autres Pages de la sidebar ne changent pas. Un état client au niveau du layout du Workspace, qui englobe la sidebar et le contenu de la Page, porte le titre en direct de la Page ouverte (son identifiant et son titre normalisé). Le champ titre le met à jour, et la liste des Pages l'utilise à la place du titre venu du serveur pour la ligne correspondante. Quitter le champ ou démonter la Page n'efface pas ce titre en direct, ce qui évite que la sidebar revienne brièvement à l'ancien titre avant la revalidation. Il s'efface dès que les données serveur de la sidebar affichent le même titre pour cette Page, et il est remplacé quand le champ titre d'une autre Page publie le sien. Une Page dont on ne modifie pas le titre affiche son titre enregistré. L'enregistrement reste au blur, Entrée ou Échap, et valider un titre inchangé n'appelle toujours pas le serveur. Spec : `.scratch/page-title-live/spec.md` (user stories 12 à 24).

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] La ligne de la Page ouverte dans la sidebar suit chaque frappe
- [ ] Les espaces de début et de fin n'apparaissent pas dans la sidebar ; un titre vidé ou fait d'espaces affiche « New page »
- [ ] Les autres Pages de la sidebar restent inchangées
- [ ] Le filtre s'applique au titre en direct (la ligne disparaît puis revient selon la correspondance)
- [ ] Pas de retour à l'ancien titre dans la sidebar au blur, ni en naviguant vers une autre Page juste après avoir tapé
- [ ] En arrivant sur une autre Page sans toucher à son titre, sa ligne affiche son titre enregistré
- [ ] L'enregistrement a toujours lieu au blur, à Entrée et à Échap, jamais à chaque frappe ; un titre inchangé n'appelle pas le serveur ; le titre survit à un rechargement
- [ ] Pas de nouveau test automatisé (cf. spec) ; les tests existants et le lint passent ; la vérification visuelle est laissée à l'utilisateur
