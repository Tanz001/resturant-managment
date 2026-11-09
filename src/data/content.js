export const navLinks = [
  { label: 'Experience', href: '/#experience', type: 'hash' },
  { label: 'Menu', href: '/menu', type: 'route' },
  { label: 'Story', href: '/#story', type: 'hash' },
  { label: 'Reserve', href: '/#reserve', type: 'hash' },
]

export const images = {
  hero:
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=2400&q=80',
  intro:
    'https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1200&q=80',
  dish1:
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=80',
  dish2:
    'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=1600&q=80',
  dish3:
    'https://images.unsplash.com/photo-1600891964092-4316c14cddb0?auto=format&fit=crop&w=1600&q=80',
  story:
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=2400&q=80',
  chef:
    'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=1400&q=80',
  atmosphere: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0d?auto=format&fit=crop&w=1600&q=80',
  ],
  reserve:
    'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0d?auto=format&fit=crop&w=2400&q=80',
  menuHero:
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=2400&q=80',
}

/** Signature dishes shown on the landing teaser */
export const dishes = [
  {
    id: 'noir-ribeye',
    category: 'Main',
    name: 'Charred Ribeye',
    description:
      'Dry-aged beef, bone marrow jus, smoked shallot, and black garlic ash.',
    price: '68',
    image: images.dish1,
  },
  {
    id: 'sable-catch',
    category: 'Catch',
    name: 'Sable & Citrus',
    description:
      'Seared sablefish, yuzu beurre blanc, fennel pollen, and caviar.',
    price: '74',
    image: images.dish2,
  },
  {
    id: 'velvet-cocoa',
    category: 'Dessert',
    name: 'Velvet Cocoa',
    description:
      'Dark chocolate crémeux, roasted hazelnut, and gold leaf.',
    price: '28',
    image: images.dish3,
  },
]

export const menuCategories = [
  {
    id: 'beginnings',
    name: 'Beginnings',
    hint: 'Cold and warm openings',
  },
  {
    id: 'garden',
    name: 'From the Garden',
    hint: 'Vegetables and lighter plates',
  },
  {
    id: 'sea',
    name: 'From the Sea',
    hint: 'Catch of the evening',
  },
  {
    id: 'land',
    name: 'From the Land',
    hint: 'Fire, slow cook, and roast',
  },
  {
    id: 'sides',
    name: 'To Share',
    hint: 'Breads and accompaniments',
  },
  {
    id: 'sweet',
    name: 'Sweet',
    hint: 'A quiet finish',
  },
  {
    id: 'drinks',
    name: 'Drinks',
    hint: 'Wine by the glass and soft serves',
  },
]

/** Full customer-facing menu — browse only */
export const fullMenu = [
  {
    id: 'oysters',
    categoryId: 'beginnings',
    name: 'Oysters, three ways',
    description: 'Mignonette, yuzu ice, and smoked chilli oil.',
    price: '28',
    tag: 'Raw',
  },
  {
    id: 'tartare',
    categoryId: 'beginnings',
    name: 'Beef tartare',
    description: 'Hand-cut fillet, cured egg yolk, mustard seed, rye crisp.',
    price: '32',
  },
  {
    id: 'foie',
    categoryId: 'beginnings',
    name: 'Torchon of foie',
    description: 'Brioche warm from the oven, quince, fleur de sel.',
    price: '36',
    tag: 'Signature',
  },
  {
    id: 'burrata',
    categoryId: 'beginnings',
    name: 'Burrata & burnt tomato',
    description: 'Aged balsamic, basil oil, black pepper.',
    price: '24',
    tag: 'Vegetarian',
  },
  {
    id: 'soup',
    categoryId: 'beginnings',
    name: 'Chestnut velouté',
    description: 'Wild mushroom, thyme, brown butter crumb.',
    price: '22',
    tag: 'Seasonal',
  },
  {
    id: 'carpaccio',
    categoryId: 'beginnings',
    name: 'Scallop carpaccio',
    description: 'Citrus, green chilli, coriander seed, olive oil.',
    price: '30',
  },

  {
    id: 'asparagus',
    categoryId: 'garden',
    name: 'Grilled asparagus',
    description: 'Hollandaise, bottarga, lemon zest.',
    price: '26',
  },
  {
    id: 'beet',
    categoryId: 'garden',
    name: 'Roasted beetroot',
    description: 'Goat cheese, hazelnut, sherry vinegar.',
    price: '22',
    tag: 'Vegetarian',
  },
  {
    id: 'mushroom',
    categoryId: 'garden',
    name: 'Wild mushrooms on toast',
    description: 'Sourdough, garlic cream, parsley.',
    price: '24',
    tag: 'Vegetarian',
  },
  {
    id: 'cabbage',
    categoryId: 'garden',
    name: 'Charred hispi cabbage',
    description: 'Anchovy butter, toasted crumbs, lemon.',
    price: '20',
  },
  {
    id: 'risotto',
    categoryId: 'garden',
    name: 'Saffron risotto',
    description: 'Aged parmesan, bone marrow optional.',
    price: '34',
    tag: 'Vegetarian',
  },

  {
    id: 'sable',
    categoryId: 'sea',
    name: 'Sable & citrus',
    description: 'Yuzu beurre blanc, fennel pollen, caviar.',
    price: '74',
    tag: 'Signature',
    image: images.dish2,
  },
  {
    id: 'lobster',
    categoryId: 'sea',
    name: 'Butter-poached lobster',
    description: 'Coral sauce, young leeks, champagne reduction.',
    price: '82',
  },
  {
    id: 'turbot',
    categoryId: 'sea',
    name: 'Turbot on the bone',
    description: 'Brown butter, capers, new potatoes.',
    price: '78',
  },
  {
    id: 'prawn',
    categoryId: 'sea',
    name: 'Tiger prawns',
    description: 'Garlic, chilli, parsley, grilled lemon.',
    price: '48',
  },
  {
    id: 'cod',
    categoryId: 'sea',
    name: 'Roasted cod',
    description: 'Clam chowder sauce, smoked bacon, chives.',
    price: '56',
  },
  {
    id: 'octopus',
    categoryId: 'sea',
    name: 'Octopus a la plancha',
    description: 'Smoked paprika, chickpea purée, herb oil.',
    price: '44',
  },

  {
    id: 'ribeye',
    categoryId: 'land',
    name: 'Charred ribeye',
    description: 'Bone marrow jus, smoked shallot, black garlic ash.',
    price: '68',
    tag: 'Signature',
    image: images.dish1,
  },
  {
    id: 'duck',
    categoryId: 'land',
    name: 'Duck breast',
    description: 'Cherry, star anise, roasted endive.',
    price: '58',
  },
  {
    id: 'lamb',
    categoryId: 'land',
    name: 'Lamb rack',
    description: 'Herb crust, jus, confit garlic.',
    price: '64',
  },
  {
    id: 'chicken',
    categoryId: 'land',
    name: 'Roast chicken for two',
    description: 'Morel cream, crisp skin, pan jus.',
    price: '72',
  },
  {
    id: 'veal',
    categoryId: 'land',
    name: 'Veal sweetbreads',
    description: 'Madeira, celeriac, crisp sage.',
    price: '52',
  },
  {
    id: 'pork',
    categoryId: 'land',
    name: 'Ibérico pork',
    description: 'Charred peach, mustard seed, thyme.',
    price: '60',
  },

  {
    id: 'fries',
    categoryId: 'sides',
    name: 'Truffle fries',
    description: 'Parmesan, chives.',
    price: '14',
  },
  {
    id: 'mash',
    categoryId: 'sides',
    name: 'Pomme purée',
    description: 'Cultured butter, white pepper.',
    price: '12',
  },
  {
    id: 'greens',
    categoryId: 'sides',
    name: 'Seasonal greens',
    description: 'Garlic oil, lemon.',
    price: '12',
  },
  {
    id: 'bread',
    categoryId: 'sides',
    name: 'House bread',
    description: 'Cultured butter, sea salt.',
    price: '9',
  },
  {
    id: 'salad',
    categoryId: 'sides',
    name: 'Leaf salad',
    description: 'Shallot vinaigrette.',
    price: '11',
  },

  {
    id: 'cocoa',
    categoryId: 'sweet',
    name: 'Velvet cocoa',
    description: 'Dark crémeux, roasted hazelnut, gold leaf.',
    price: '28',
    tag: 'Signature',
    image: images.dish3,
  },
  {
    id: 'tart',
    categoryId: 'sweet',
    name: 'Lemon tart',
    description: 'Burnt meringue, short pastry.',
    price: '18',
  },
  {
    id: 'souffle',
    categoryId: 'sweet',
    name: 'Grand Marnier soufflé',
    description: 'Please allow twenty minutes.',
    price: '24',
  },
  {
    id: 'cheese',
    categoryId: 'sweet',
    name: 'Cheese selection',
    description: 'Three cheeses, honey, crackers.',
    price: '26',
  },
  {
    id: 'sorbet',
    categoryId: 'sweet',
    name: 'Seasonal sorbet',
    description: 'Two scoops, fresh fruit.',
    price: '14',
  },

  {
    id: 'champagne',
    categoryId: 'drinks',
    name: 'Champagne, glass',
    description: 'House grower selection.',
    price: '22',
  },
  {
    id: 'white',
    categoryId: 'drinks',
    name: 'White wine, glass',
    description: 'Ask for tonight’s pour.',
    price: '16',
  },
  {
    id: 'red',
    categoryId: 'drinks',
    name: 'Red wine, glass',
    description: 'Ask for tonight’s pour.',
    price: '16',
  },
  {
    id: 'cocktail',
    categoryId: 'drinks',
    name: 'Noir Negroni',
    description: 'Gin, vermouth, bitter cacao.',
    price: '18',
  },
  {
    id: 'mocktail',
    categoryId: 'drinks',
    name: 'Citrus highball',
    description: 'Yuzu, soda, mint — no alcohol.',
    price: '12',
  },
  {
    id: 'coffee',
    categoryId: 'drinks',
    name: 'Espresso / filter',
    description: 'Single origin, roasted weekly.',
    price: '6',
  },
  {
    id: 'tea',
    categoryId: 'drinks',
    name: 'Tea service',
    description: 'Earl grey, jasmine, or mint.',
    price: '7',
  },
]

export const atmosphereCaptions = [
  'The Dining Room',
  'At the Pass',
  'Table Ritual',
  'Evening Light',
]

export const testimonials = [
  {
    id: 't1',
    name: 'Camille Durand',
    role: 'Food editor, Le Goût',
    avatar: 'https://i.pravatar.cc/160?img=47',
    rating: 5,
    quote:
      'The sablefish arrived like a quiet secret — yuzu, smoke, and a sauce I still think about. Service was invisible in the best possible way.',
    dish: 'Sable & Citrus',
  },
  {
    id: 't2',
    name: 'Marcus Oyelaran',
    role: 'Anniversary dinner',
    avatar: 'https://i.pravatar.cc/160?img=12',
    rating: 5,
    quote:
      'We booked for two and left feeling like the room had been built around us. The ribeye alone is worth the flight.',
    dish: 'Charred Ribeye',
  },
  {
    id: 't3',
    name: 'Ines Carvalho',
    role: 'Architect',
    avatar: 'https://i.pravatar.cc/160?img=32',
    rating: 5,
    quote:
      'Every plate felt composed — restraint, texture, light. It is rare to eat somewhere that understands silence as an ingredient.',
    dish: 'Velvet Cocoa',
  },
  {
    id: 't4',
    name: 'Jonah Weiss',
    role: 'Sommelier, visiting from Vienna',
    avatar: 'https://i.pravatar.cc/160?img=59',
    rating: 5,
    quote:
      'A wine list with real point of view, poured by people who clearly love it. The pairing with the cocoa dessert was inspired.',
    dish: 'Wine pairing',
  },
  {
    id: 't5',
    name: 'Amara Singh',
    role: 'Birthday with friends',
    avatar: 'https://i.pravatar.cc/160?img=5',
    rating: 5,
    quote:
      'Warm, unhurried, never stiff. They remembered a detail from our booking note and it made the whole night.',
    dish: 'Tasting menu',
  },
  {
    id: 't6',
    name: 'Théo Lambert',
    role: 'Regular since 2022',
    avatar: 'https://i.pravatar.cc/160?img=68',
    rating: 5,
    quote:
      'I keep coming back for the bread. Then I stay for everything else. Consistently one of the best tables in Paris.',
    dish: 'House sourdough',
  },
]

export function itemsInMenuCategory(categoryId) {
  return fullMenu.filter((item) => item.categoryId === categoryId)
}
