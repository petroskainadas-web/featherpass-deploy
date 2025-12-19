// Phase 5: TypeScript interfaces for content types

export interface LibraryContent {
  id: string;
  title: string;
  content_type: 'monster' | 'spell' | 'magic_item' | 'subrace' | 'npc' | 'subclass' | 'feat';
  content_data: MonsterData | SpellData | MagicItemData | SubraceData | NpcData | SubclassData | FeatData;
  level?: string;
  rarity?: string;
  tags?: string[];
  download_count: number;
  image_id?: string;
  pdf_id?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface Article {
  id: number;
  title: string;
  article_type: 'Design Notes' | 'Plot Crafting' | 'Worldbuilding Tips';
  tldr: string;
  body: string;
  tags?: string[];
  read_time: number;
  view_count: number;
  like_count: number;
  published_date: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface GalleryImage {
  id: string;
  title: string;
  image_type: string;
  orientation: 'landscape' | 'portrait' | 'square';
  image_description?: string;
  image_creation_tool?: string;
  prompt_used?: string;
  tags?: string[];
  view_count: number;
  image_file_id?: string;
  published_date: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// Content Data Types
export interface MonsterData {
  name: string;
  type: string;
  size: string;
  alignment: string;
  armor_class: number;
  hit_points: string;
  speed: string;
  abilities: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  skills?: string[];
  damage_resistances?: string[];
  damage_immunities?: string[];
  condition_immunities?: string[];
  senses?: string[];
  languages?: string[];
  challenge_rating: string;
  special_abilities?: Array<{
    name: string;
    description: string;
  }>;
  actions?: Array<{
    name: string;
    description: string;
  }>;
  legendary_actions?: Array<{
    name: string;
    description: string;
  }>;
  lair_actions?: Array<{
    name: string;
    description: string;
  }>;
  description?: string;
}

export interface SpellData {
  name: string;
  level: number;
  school: string;
  casting_time: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  at_higher_levels?: string;
}

export interface MagicItemData {
  name: string;
  rarity: string;
  type: string;
  requires_attunement: boolean;
  description: string;
  properties?: string[];
}

export interface SubraceData {
  name: string;
  parent_race: string;
  ability_score_increase: string;
  traits: Array<{
    name: string;
    description: string;
  }>;
  description?: string;
}

export interface NpcData {
  name: string;
  race: string;
  class?: string;
  level?: number;
  alignment: string;
  personality_traits?: string[];
  ideals?: string[];
  bonds?: string[];
  flaws?: string[];
  appearance?: string;
  background?: string;
  abilities?: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
}

export interface SubclassData {
  name: string;
  parent_class: string;
  description: string;
  features: Array<{
    level: number;
    name: string;
    description: string;
  }>;
  spells?: string[];
}

export interface FeatData {
  category: 'Legacy' | 'Origin' | 'General' | 'Fighting Style' | 'Spell Casting' | 'Epic Boon';
  overview: string;
  fullDescription: string;
}
