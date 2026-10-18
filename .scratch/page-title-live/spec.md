# Titre de Page : sans scrollbar et reflété en direct dans la sidebar

**Status:** ready-for-agent

## Problem Statement

Le titre d'une Page s'édite sur place, mais le champ affiche une scrollbar, ce qui ne ressemble pas à un titre. Selon le navigateur, un titre long défile dans une seule ligne au lieu de passer à la ligne comme un vrai titre. Et quand je renomme une Page, la sidebar ne change qu'au moment où je quitte le champ : pendant que j'écris, la liste des Pages affiche encore l'ancien titre.

## Solution

Le titre d'une Page n'a jamais de scrollbar. Il reste sur une seule ligne logique : ni Entrée ni un collage ne peuvent y insérer de saut de ligne. Mais un titre trop long pour la largeur passe visuellement à la ligne, et le champ grandit pour l'afficher en entier, dans tous les navigateurs.

Pendant que je tape, la ligne de la Page ouverte dans la sidebar affiche le titre à chaque frappe, sous sa forme normalisée : espaces de début et de fin retirés, « New page » si le titre est vide. L'enregistrement ne change pas : il a toujours lieu quand je quitte le champ (blur, Entrée ou Échap).

## User Stories

### Champ titre

1. En tant qu'utilisateur, je veux que le titre d'une Page n'affiche jamais de scrollbar, afin qu'il ressemble à un titre et non à un champ de formulaire.
2. En tant qu'utilisateur, je veux qu'un titre trop long pour la largeur de la page passe à la ligne, afin de le lire en entier sans faire défiler.
3. En tant qu'utilisateur, je veux que le champ grandisse en hauteur à mesure que le titre passe sur plusieurs lignes, afin que rien ne soit coupé.
4. En tant qu'utilisateur, je veux que le champ rétrécisse quand je raccourcis le titre, afin de ne pas garder d'espace vide sous le titre.
5. En tant qu'utilisateur, je veux qu'un titre long déjà enregistré s'affiche en entier dès l'ouverture de la Page, afin de ne pas avoir à cliquer dedans pour le voir.
6. En tant qu'utilisateur, je veux que la hauteur du titre s'ajuste quand la largeur de la fenêtre change, afin que le passage à la ligne reste correct quand je redimensionne.
7. En tant qu'utilisateur de Firefox ou d'un autre navigateur qui ne gère pas l'ajustement automatique de la hauteur des champs, je veux le même passage à la ligne qu'ailleurs, afin que le titre ne soit pas coupé.
8. En tant qu'utilisateur, je veux qu'Entrée ne crée jamais de saut de ligne dans le titre, y compris avec Shift, afin qu'un titre reste sur une seule ligne logique.
9. En tant qu'utilisateur, je veux que les sauts de ligne d'un texte collé deviennent des espaces, afin qu'un titre collé depuis plusieurs lignes reste sur une seule.
10. En tant qu'utilisateur, je veux qu'Entrée, Échap et la sortie du champ continuent d'enregistrer le titre, afin de garder le comportement actuel.
11. En tant qu'utilisateur, je veux que la limite de 200 caractères continue de s'appliquer pendant la saisie, afin que rien ne change de ce côté.

### Sidebar en direct

12. En tant qu'utilisateur, je veux que la ligne de la Page ouverte dans la sidebar affiche le titre à chaque frappe, afin de voir le renommage pendant que j'écris.
13. En tant qu'utilisateur, je veux que la sidebar affiche le titre sans ses espaces de début et de fin, afin qu'elle montre ce qui sera enregistré.
14. En tant qu'utilisateur, je veux que la sidebar affiche « New page » quand j'ai vidé le titre ou que je n'y ai laissé que des espaces, afin qu'aucune ligne de la liste ne soit vide, même un instant.
15. En tant qu'utilisateur, je veux que les autres Pages de la sidebar restent inchangées pendant que j'écris, afin que seule la Page ouverte reflète ma saisie.
16. En tant qu'utilisateur, je veux qu'un titre long reste tronqué dans la sidebar comme aujourd'hui, afin que la liste garde sa mise en page.
17. En tant qu'utilisateur, je veux que le filtre de la sidebar s'applique au titre affiché en direct, afin que la liste filtrée corresponde à ce que je vois.
18. En tant qu'utilisateur, je veux que la ligne de la Page ouverte disparaisse de la liste filtrée dès que son titre ne correspond plus au filtre, et y revienne s'il correspond de nouveau, afin que le filtre reste cohérent.
19. En tant qu'utilisateur, je veux que la sidebar ne revienne pas brièvement à l'ancien titre quand je quitte le champ ou que je navigue vers une autre Page juste après avoir tapé, afin de ne pas voir de clignotement.
20. En tant qu'utilisateur, je veux que la sidebar garde le titre enregistré une fois l'enregistrement terminé, afin que l'affichage en direct et l'état enregistré se rejoignent.
21. En tant qu'utilisateur, je veux qu'en arrivant sur une autre Page, sa ligne dans la sidebar affiche son titre enregistré tant que je ne le modifie pas, afin que l'affichage en direct ne déborde pas d'une Page à l'autre.

### Enregistrement

22. En tant qu'utilisateur, je veux que le titre soit toujours enregistré au blur, à Entrée et à Échap, et pas à chaque frappe, afin que le modèle d'enregistrement ne change pas.
23. En tant qu'utilisateur, je veux que valider un titre inchangé n'appelle toujours pas le serveur, afin de ne pas faire d'enregistrement inutile.
24. En tant qu'utilisateur, je veux retrouver le titre enregistré après un rechargement, comme aujourd'hui, afin que le renommage soit durable.

## Implementation Decisions

- **Glossaire :** pas de changement dans `CONTEXT.md`. Le texte en cours de saisie dans le champ titre (le « brouillon ») est un détail d'interface, pas un terme du domaine. Le Titre par défaut reste « New page ».
- **Champ titre :** on garde le `textarea`, sans passer à un élément `contentEditable` qui obligerait à nettoyer le HTML collé et à gérer le curseur à la main. On masque son débordement pour qu'aucune scrollbar ne puisse apparaître. L'ajustement automatique de la hauteur par le CSS reste le mécanisme principal.
- **Secours pour la hauteur :** là où le navigateur ne gère pas l'ajustement automatique de la hauteur par le CSS, le champ fixe sa hauteur sur la hauteur de son contenu. Il le fait au montage (titre enregistré long), à chaque changement de valeur et à chaque changement de largeur du champ (redimensionnement de la fenêtre). Ce secours ne s'active pas là où le CSS suffit.
- **Saisie inchangée :** le comportement d'Entrée (y compris avec Shift) et d'Échap (enregistrer puis quitter le champ, en respectant la composition IME), le remplacement des sauts de ligne collés par des espaces et la troncature à 200 caractères ne changent pas.
- **État partagé côté client :** un état client vit au niveau du layout du Workspace, englobe à la fois la sidebar et le contenu de la Page, et contient le titre en direct de la Page ouverte : l'identifiant de la Page et son titre normalisé. Le champ titre le met à jour à chaque frappe. La liste des Pages de la sidebar le lit : pour la ligne dont l'identifiant correspond, elle utilise ce titre à la place du titre venu du serveur, pour l'affichage comme pour le filtre.
- **Normalisation à l'affichage :** le titre en direct passe par la même règle de normalisation que l'enregistrement (la règle partagée du module de titre de Page, sans import serveur). La sidebar montre donc toujours ce que donnerait l'enregistrement.
- **Durée de vie du titre en direct :** quitter le champ ou démonter la Page n'efface pas le titre en direct. On évite ainsi que la sidebar affiche l'ancien titre entre l'enregistrement et la revalidation du layout. Le titre en direct s'efface dès que les données serveur de la sidebar affichent le même titre pour cette Page, ou il est remplacé quand le champ titre d'une autre Page publie le sien. Une Page dont on ne modifie pas le titre n'en publie aucun et affiche son titre enregistré.
- **Enregistrement inchangé :** l'action de renommage, sa revalidation du layout et la règle « titre inchangé, pas d'appel serveur » ne changent pas. Le champ titre reste keyé par Page, il repart donc de zéro sur chaque Page.

## Testing Decisions

- **Pas de nouveau point de test.** Le comportement est entièrement côté client. Le projet n'a pas d'infrastructure de test de composants (vitest en environnement `node`), et la partie risquée (scrollbar, passage à la ligne, hauteur) dépend de la mise en page, qu'un DOM simulé ne calcule pas. On ne monte pas cette infrastructure pour cette spec.
- **Déjà couvert :** la normalisation (trim, Titre par défaut, limite de 200 caractères) est testée par les tests du module Pages, qui restent la référence. Ils doivent continuer de passer, et le lint aussi.
- **Vérification manuelle par l'utilisateur :** l'utilisateur vérifie lui-même dans l'application, dans au moins un navigateur qui gère l'ajustement automatique de la hauteur et un qui ne le gère pas (Firefox) :
  - aucune scrollbar sur le titre, quelle que soit sa longueur ;
  - un titre long passe à la ligne, le champ grandit et rétrécit, y compris au redimensionnement et à l'ouverture d'une Page dont le titre enregistré est long ;
  - Entrée et Shift+Entrée n'insèrent pas de saut de ligne, et un collage multiligne donne une seule ligne ;
  - la sidebar suit chaque frappe, affiche « New page » pour un titre vidé, et ne clignote pas au blur ni à la navigation ;
  - le filtre suit le titre en direct.

## Out of Scope

- L'enregistrement continu (debouncé) pendant la frappe : l'enregistrement reste au blur.
- Le titre de l'onglet du navigateur (`document.title` ou metadata par Page), qui affiche toujours le titre générique de l'application.
- Qu'Entrée envoie le curseur dans le premier Block de l'éditeur, comme dans Notion.
- Un placeholder grisé « New page » dans le champ titre vide.
- L'infrastructure de test de composants (jsdom, Testing Library), à reprendre dans une spec à part si des composants client plus riches arrivent (arbre de Sous-pages, glisser-déposer).
- La gestion visible d'un échec d'enregistrement.

## Further Notes

- Si l'enregistrement échoue, la sidebar continue d'afficher le titre en direct, qui n'a pas été enregistré, jusqu'à la prochaine revalidation ou la prochaine saisie sur une autre Page. C'est un cas marginal, accepté puisque la gestion des échecs est hors périmètre. Un rechargement affiche le titre réellement enregistré.
- Si la même Page est renommée depuis un autre onglet pendant que son titre en direct est affiché ici, ce titre masque le nouveau titre jusqu'à ce qu'il soit effacé. C'est un cas rare, accepté.
