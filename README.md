# CV App — Front

Application Angular permettant de construire un CV et d'en exporter le rendu en PDF via l'API backend.

## Stack

- Angular (build de production, `--configuration production`)
- Servi en production par **nginx** (image `nginx:alpine`)

## Lancer avec Docker

### Build de l'image

```bash
docker build -t cv-front .
```

### Lancer le conteneur

```bash
docker run -d --name cv-front -p 80:80 cv-front
```

L'application est accessible sur `http://localhost`.

### Vérifier que ça tourne

```bash
docker ps
docker logs -f cv-front
```

### Arrêter / supprimer le conteneur

```bash
docker stop cv-front
docker rm cv-front
```