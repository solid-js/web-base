# TODO

## Projet web-base


### But du projet

Dans l'ordre :
- Pouvoir démarrer un projet front rapidement
- Utilisation de composants solid (ts + less + json + hbs)
- Génération de design pattern depuis les composants solid
- Gestion des tests unitaires
- Gestion d'un script make pour être conforme avec le process d'intégration continue

### Ce que le build doit gérer

- OK Compilation typescript
- OK Compilation less
- OK Inclusion de fichiers JSON
- OK Gestion des templates
- Gestion du webserver de base pour les projets non PHP (et la pattern)
- Gestion assemble (non PHP et pattern)
- Gestion des sprites pixel
- Gestion des sprites vectos
- Compression des assets (js / css / img)


## Projet solidify

### Fonctionnalité vue solidify

Nous devons mixer les vues classiques et les vues React, les 2 ne servent pas à faire les mêmes choses.
Nos vues classiques vont nous aider à créer des composants rapidement avec une DOM déjà posée par PHP.
Les composants React vont plutôt servir a du full web-app.

#### Vues classiques
- Gestion des vues classiques avec séléction jQuery + évènements + Central.
- L'idée ici est d'avoir des scripts instanciés depuis notre DOM
- Génération de ces composants depuis la DOM et le script
- Pas besoin de trucs de folie, juste les bons helpers
- Librairie pour gérer la vie de ces composants (récupérer l'instance depuis la DOM, instancier, détruire, etc)
- S'inspirer de la notion d'état de React
- S'inspirer de la notion de props de React

#### Vues react
- Gestion des vues React pour de la génération full JS
- Génération de ces composants depuis la DOM et le script
- Doit aussi avoir les fonctionnalité de ciblage globales (helpers jQuery) mais pas locales (pas besoin de cibler dans le template, React fait ça très bien)
- Doit pouvoir aussi gérer Central
- Librairie pour gérer la vie de ces composants (récupérer l'instance depuis la DOM, instancier, détruire, etc)


### Navigation, routage et controlleurs


### Models