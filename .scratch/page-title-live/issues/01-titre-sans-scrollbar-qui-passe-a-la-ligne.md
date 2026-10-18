# 01: Titre de Page sans scrollbar, qui passe à la ligne partout

**What to build:** Le titre d'une Page n'affiche jamais de scrollbar, quelle que soit sa longueur. Il reste sur une seule ligne logique : Entrée (y compris Shift+Entrée) enregistre et quitte le champ sans insérer de saut de ligne, et les sauts de ligne d'un texte collé deviennent des espaces, comme aujourd'hui. Un titre trop long pour la largeur passe visuellement à la ligne, et le champ grandit ou rétrécit pour l'afficher en entier : à l'ouverture d'une Page dont le titre enregistré est long, à chaque frappe et quand la largeur de la fenêtre change. On garde le `textarea`, on masque son débordement, et l'ajustement automatique de la hauteur par le CSS reste le mécanisme principal. Là où le navigateur ne le gère pas (Firefox), un secours fixe la hauteur sur celle du contenu au montage, à chaque changement de valeur et à chaque changement de largeur. Ce secours ne s'active pas là où le CSS suffit. Entrée, Échap, la composition IME, la limite de 200 caractères et l'enregistrement au blur ne changent pas. Spec : `.scratch/page-title-live/spec.md` (user stories 1 à 11).

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Aucune scrollbar sur le titre, même pour un titre de 200 caractères
- [ ] Un titre long passe à la ligne ; le champ grandit en tapant et rétrécit en effaçant
- [ ] Une Page dont le titre enregistré est long l'affiche en entier dès l'ouverture
- [ ] La hauteur s'ajuste quand on redimensionne la fenêtre
- [ ] Même comportement dans un navigateur sans ajustement automatique de la hauteur par le CSS (Firefox) ; le secours ne s'active pas ailleurs
- [ ] Entrée et Shift+Entrée n'insèrent pas de saut de ligne ; un collage multiligne donne une seule ligne
- [ ] Entrée, Échap et blur enregistrent toujours ; la limite de 200 caractères s'applique toujours
- [ ] Pas de nouveau test automatisé (cf. spec) ; les tests existants et le lint passent ; la vérification visuelle est laissée à l'utilisateur
