# Pocket Field Guide

A pocket-sized field guide for curious trainers. Search the Pokédex, check stats and shiny artwork, or browse Pokémon items, moves, and generations. Data comes from [PokéAPI](https://pokeapi.co/).

## Get started

```sh
npm install
npx expo start
```

Open the app in Expo Go or a development build. Press `w` in the Expo CLI for web. You’ll need internet the first time you fetch data and artwork.

## Field notes

- API responses are kept in SQLite and reused on later visits; pull to refresh to fetch fresh data.
- Appearance follows your device until you choose a theme in Discover.
- Web hosting needs `Cross-Origin-Embedder-Policy: credentialless` and `Cross-Origin-Opener-Policy: same-origin` for SQLite.
