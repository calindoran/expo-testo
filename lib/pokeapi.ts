export const POKE_API = 'https://pokeapi.co/api/v2';

export type CollectionType = 'items' | 'moves' | 'generations';
export type CatalogType = 'pokemon' | CollectionType;

export interface NamedResource {
  name: string;
  url: string;
}

export interface ResourceList {
  count: number;
  results: NamedResource[];
}

export interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  abilities: { ability: NamedResource; is_hidden: boolean }[];
  types: { slot: number; type: NamedResource }[];
  stats: { base_stat: number; stat: NamedResource }[];
  sprites: {
    front_default: string | null;
    other?: {
      'official-artwork'?: {
        front_default: string | null;
        front_shiny: string | null;
      };
    };
  };
}

export interface ItemDetail {
  id: number;
  name: string;
  cost: number;
  category: NamedResource;
  attributes: NamedResource[];
  sprites: { default: string | null };
  effect_entries: { short_effect: string; language: NamedResource }[];
}

export interface MoveDetail {
  id: number;
  name: string;
  accuracy: number | null;
  power: number | null;
  pp: number | null;
  type: NamedResource;
  damage_class: NamedResource;
  effect_entries: { short_effect: string; language: NamedResource }[];
}

export interface GenerationDetail {
  id: number;
  name: string;
  main_region: NamedResource | null;
  pokemon_species: NamedResource[];
}

export const COLLECTIONS: Record<CollectionType, { title: string; description: string }> = {
  items: { title: 'Items', description: 'Tools, treats, and treasures from the Pokémon world.' },
  moves: { title: 'Moves', description: 'Explore the moves Pokémon can learn in battle.' },
  generations: { title: 'Generations', description: 'Meet the regions and Pokémon from each era.' },
};

const endpointByType: Record<CatalogType, string> = {
  pokemon: 'pokemon',
  items: 'item',
  moves: 'move',
  generations: 'generation',
};

export function catalogUrl(type: CatalogType): string {
  return `${POKE_API}/${endpointByType[type]}?limit=10000`;
}

export function detailUrl(type: CatalogType, name: string): string {
  return `${POKE_API}/${endpointByType[type]}/${encodeURIComponent(name)}`;
}

export function resourceId(url: string): number {
  const match = url.match(/\/(\d+)\/?$/);
  return match ? Number(match[1]) : 0;
}

export function pokemonArtwork(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export function formatName(value: string): string {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export const TYPE_COLORS: Record<string, string> = {
  bug: '#8D9F35',
  dark: '#66554F',
  dragon: '#6E59D9',
  electric: '#D6A800',
  fairy: '#CE70A4',
  fighting: '#C34B36',
  fire: '#E5663D',
  flying: '#758BE3',
  ghost: '#705B9B',
  grass: '#63A65A',
  ground: '#B78A45',
  ice: '#59AFC0',
  normal: '#8A8A78',
  poison: '#9858A8',
  psychic: '#D85C83',
  rock: '#9B874C',
  steel: '#778494',
  water: '#4D83CF',
};
