# Brewing Guide

## Getting Started

After installing and configuring, it's time to brew some potions! Unlike in vanilla Minecraft, it's not as easy as adding an ingredient to a brewing Stand and waiting for it to finish. Depending on the recipe the whole process can be difficult and time consuming. Some recipes may need a high precision when it comes to ingredients or any other step in the process. If particular step was done incorrectly or at the wrong time, the quality of the potion may suffer or you'll end up with an entirely different brew!

Depending on the Recipe, some steps may not be needed, the following instructions describes the most common procedure of brewing.

## Brewing

1. **Obtain a cauldron and fill it with water.**

2. **Add a heat source under your cauldron.** This can be one of many:
   - Fire or soul fire
   - Lava or magma blocks
   - Campfire or soul campfire

3. **Add the ingredients for your recipe** by right clicking the cauldron with each one.

4. **Use a clock on the cauldron** to see how long the drink has been brewing for.

5. **When the cauldron has brewed for the instructed amount of time**, use 3 glass bottles to fully extract the contents of the cauldron.

At this point, for some recipes, you may be done! Other recipes may require aging and/or distilling. Please proceed to the next page for documentation of this process.

## Aging

Aging is a feature in BreweryX that allows you to age your brews in barrels. When a brew is aged, it will gain additional effects and values based on the brew's recipe. The aging process is optional on a per-brew basis and can be configured for each brew in the recipes.yml file.

### Creating a Barrel

To create a barrel, you'll need to construct it from wooden planks and place a sign with the text "barrel" on it. The barrel design can vary in size:

- **Small barrel**: A compact, blocky structure with a 3x3 base and tiered top layers
- **Big barrel**: A larger, elongated structure with a 4-block length and elevated on wooden legs

**Important**: A sign with the text "barrel" is required for the barrel to function properly!

### Using Barrels

After you put your drinks in barrels, you just need to wait! 1 "year" is equal to 1 in-game day. If you overdo the drink or use the wrong type of wood, the drink is likely to spoil.



## Troubleshooting

If your brew doesn't turn out as expected:
- Check that all ingredients were added in the correct order
- Verify the brewing time was accurate
- Ensure your barrel is properly constructed with the required sign
- Confirm you're using the right type of wood for aging
- Check that your heat source is sufficient and consistent

## Recipes

Below is a comprehensive list of all available brewing recipes. Each recipe includes detailed information about ingredients, brewing time, aging requirements, and expected results.

### Beer Varieties

#### Wheat Beer
- **Name**: Skunky Wheatbeer / Wheatbeer / Fine Wheatbeer
- **Ingredients**: Wheat (3)
- **Cooking Time**: 8 minutes
- **Distillation**: None required
- **Wood Type**: Birch (1)
- **Aging**: 2 years
- **Color**: Golden (#ffb84d)
- **Difficulty**: 1/10 (Easy)
- **Alcohol Content**: 5%
- **Special Notes**: Refreshing taste when brewed well

#### Standard Beer
- **Name**: Skunky Beer / Beer / Fine Beer
- **Ingredients**: Wheat (6)
- **Cooking Time**: 8 minutes
- **Distillation**: None required
- **Wood Type**: Any wood (0)
- **Aging**: 3 years
- **Color**: Bright yellow (#ffd333)
- **Difficulty**: 1/10 (Easy)
- **Alcohol Content**: 6%
- **Special Notes**: Crisp taste when properly brewed

#### Dark Beer
- **Name**: Skunky Darkbeer / Darkbeer / Fine Darkbeer
- **Ingredients**: Wheat (6)
- **Cooking Time**: 8 minutes
- **Distillation**: None required
- **Wood Type**: Dark Oak (6)
- **Aging**: 8 years
- **Color**: Deep red (#650013)
- **Difficulty**: 2/10 (Easy)
- **Alcohol Content**: 7%
- **Special Notes**: Roasted taste, requires longer aging

### Wine & Mead

#### Red Wine
- **Name**: Red Wine
- **Ingredients**: Sweet Berries (5)
- **Cooking Time**: 5 minutes
- **Distillation**: None required
- **Wood Type**: Any wood (0)
- **Aging**: 20 years
- **Color**: Red
- **Difficulty**: 4/10 (Medium)
- **Alcohol Content**: 8%
- **Quality Effects**:
  - Poor: Harsh, corked taste
  - Normal: Mellow flavor
  - Excellent: Full-bodied wine

#### Mead
- **Name**: Awkward Mead / Mead / Golden Mead
- **Ingredients**: Sugar Cane (6)
- **Cooking Time**: 3 minutes
- **Distillation**: None required
- **Wood Type**: Jungle (2)
- **Aging**: 4 years
- **Color**: Orange
- **Difficulty**: 2/10 (Easy)
- **Alcohol Content**: 9%
- **Special Notes**: Has a golden shine when brewed perfectly

#### Apple Mead
- **Name**: Apple Mead / Sweet Apple Mead / Sweet Golden Apple Mead
- **Ingredients**: Sugar Cane (6), Apple (2)
- **Cooking Time**: 4 minutes
- **Distillation**: None required
- **Wood Type**: Jungle (2)
- **Aging**: 4 years
- **Color**: Orange
- **Difficulty**: 4/10 (Medium)
- **Alcohol Content**: 11%
- **Effects**: Water Breathing (1-2 levels, 150 seconds)
- **Quality Effects**:
  - Poor: Questionable apple presence
  - Normal: Refreshing apple taste
  - Excellent: Sweetest hint of apple

#### Apple Cider
- **Name**: Poor Cidre / Apple Cider / Great Apple Cider
- **Ingredients**: Apple (14)
- **Cooking Time**: 7 minutes
- **Distillation**: None required
- **Wood Type**: Any wood (0)
- **Aging**: 3 years
- **Color**: Orange (#f86820)
- **Difficulty**: 4/10 (Medium)
- **Alcohol Content**: 7%

### Spirits & Liquors

#### Apple Liquor
- **Name**: Sour Apple Liquor / Apple Liquor / Calvados
- **Ingredients**: Apple (12)
- **Cooking Time**: 16 minutes
- **Distillation**: 3 runs
- **Wood Type**: Acacia (5)
- **Aging**: 6 years
- **Color**: Bright Red
- **Difficulty**: 5/10 (Medium)
- **Alcohol Content**: 14%
- **Quality Effects**:
  - Poor: Sour like acid
  - Excellent: Good apple liquor

#### Whiskey
- **Name**: Unsightly Whiskey / Whiskey / Scotch Whiskey
- **Ingredients**: Wheat (10)
- **Cooking Time**: 10 minutes
- **Distillation**: 2 runs (50 seconds each)
- **Wood Type**: Spruce (4)
- **Aging**: 18 years
- **Color**: Orange
- **Difficulty**: 7/10 (Hard)
- **Alcohol Content**: 26%
- **Special Notes**: Single malt whiskey

#### Rum
- **Name**: Bitter Rum / Spicy Rum / Golden Rum
- **Ingredients**: Sugar Cane (18)
- **Cooking Time**: 6 minutes
- **Distillation**: 2 runs (30 seconds each)
- **Wood Type**: Jungle (2)
- **Aging**: 14 years
- **Color**: Dark Red
- **Difficulty**: 6/10 (Medium)
- **Alcohol Content**: 30%
- **Effects**: Fire Resistance (1 level, 20-100 seconds), Poison (1-0 levels, 30-0 seconds)
- **Quality Effects**:
  - Poor: Too bitter to drink
  - Normal: Spiced by the barrel
  - Excellent: Spiced gold

#### Vodka
- **Name**: Lousy Vodka / Vodka / Russian Vodka
- **Ingredients**: Potato (10)
- **Cooking Time**: 15 minutes
- **Distillation**: 3 runs
- **Aging**: None
- **Color**: White
- **Difficulty**: 4/10 (Medium)
- **Alcohol Content**: 20%
- **Effects**: Weakness (15 seconds), Poison (10 seconds)
- **Special Notes**: Almost undrinkable when poorly made

#### Mushroom Vodka
- **Name**: Mushroom Vodka / Mushroom Vodka / Glowing Mushroom Vodka
- **Ingredients**: Potato (10), Red Mushroom (3), Brown Mushroom (3)
- **Cooking Time**: 18 minutes
- **Distillation**: 5 runs
- **Aging**: None
- **Color**: Pink (#ff9999)
- **Difficulty**: 7/10 (Hard)
- **Alcohol Content**: 18%
- **Effects**: Weakness (80 seconds), Confusion (27 seconds), Night Vision (50-80 seconds), Blindness (12-2 seconds), Slow (10-3 seconds)
- **Special Notes**: Glows in the dark when perfectly brewed

#### Gin
- **Name**: Pale Gin / Gin / Old Tom Gin
- **Ingredients**: Wheat (9), Blue Flowers (6), Apple (1)
- **Cooking Time**: 6 minutes
- **Distillation**: 2 runs
- **Aging**: None
- **Color**: Light blue (#99ddff)
- **Difficulty**: 6/10 (Medium)
- **Alcohol Content**: 20%
- **Quality Effects**:
  - Normal: With the taste of juniper
  - Excellent: Perfectly finished off with juniper

#### Tequila
- **Name**: Mezcal / Tequila / Tequila Anejo
- **Ingredients**: Cactus (8)
- **Cooking Time**: 15 minutes
- **Distillation**: 2 runs
- **Wood Type**: Birch (1)
- **Aging**: 12 years
- **Color**: Yellow (#f5f07e)
- **Difficulty**: 5/10 (Medium)
- **Alcohol Content**: 20%
- **Special Notes**: Desert spirit

#### Absinthe
- **Name**: Poor Absinthe / Absinthe / Strong Absinthe
- **Ingredients**: Grass (15)
- **Cooking Time**: 3 minutes
- **Distillation**: 6 runs (80 seconds each)
- **Aging**: None
- **Color**: Green
- **Difficulty**: 8/10 (Very Hard)
- **Alcohol Content**: 42%
- **Effects**: Poison (15-25 seconds)
- **Special Notes**: High proof liquor

#### Green Absinthe
- **Name**: Poor Absinthe / Green Absinthe / Bright Green Absinthe
- **Ingredients**: Grass (17), Poisonous Potato (2)
- **Cooking Time**: 5 minutes
- **Distillation**: 6 runs (85 seconds each)
- **Aging**: None
- **Color**: Lime
- **Difficulty**: 9/10 (Extremely Hard)
- **Alcohol Content**: 46%
- **Effects**: Poison (25-40 seconds), Harm (2 levels), Night Vision (40-60 seconds)
- **Special Notes**: Looks poisonous

### Non-Alcoholic Drinks

#### Potato Soup
- **Name**: Potato Soup
- **Ingredients**: Potato (5), Grass (3)
- **Cooking Time**: 3 minutes
- **Color**: Orange
- **Difficulty**: 1/10 (Easy)
- **Effects**: Heal (0-1 levels)

#### Coffee
- **Name**: Stale Coffee / Coffee / Strong Coffee
- **Ingredients**: Cocoa Beans (12), Milk Bucket (2)
- **Cooking Time**: 2 minutes
- **Color**: Black
- **Difficulty**: 3/10 (Easy)
- **Alcohol Content**: -6% (reduces existing alcohol)
- **Effects**: Regeneration (1 level, 2-5 seconds), Speed (1 level, 30-140 seconds)
- **Quality Effects**:
  - Poor: Probably a week old

#### Hot Chocolate
- **Name**: Hot Chocolate
- **Ingredients**: Cookie (3)
- **Cooking Time**: 2 minutes
- **Color**: Dark Red
- **Difficulty**: 2/10 (Easy)
- **Effects**: Fast Digging (40 seconds)

#### Iced Coffee
- **Name**: Watery Coffee / Iced Coffee / Strong Iced Coffee
- **Ingredients**: Cookie (8), Snowball (4), Milk Bucket (1)
- **Cooking Time**: 1 minute
- **Color**: Black
- **Difficulty**: 4/10 (Medium)
- **Alcohol Content**: -8% (reduces existing alcohol)
- **Effects**: Regeneration (30 seconds), Speed (10 seconds)

### Special Varieties

#### Eggnog
- **Name**: Egg Liquor / Eggnog / Advocaat
- **Ingredients**: Egg (5), Sugar (2), Milk Bucket (1)
- **Cooking Time**: 2 minutes
- **Aging**: 3 years
- **Color**: Light yellow (#ffe680)
- **Difficulty**: 4/10 (Medium)
- **Alcohol Content**: 10%
- **Special Notes**: Made with raw egg

#### Golden Vodka
- **Name**: Rancid Vodka / Golden Vodka / Shimmering Golden Vodka
- **Ingredients**: Potato (10), Gold Nugget (2)
- **Cooking Time**: 18 minutes
- **Distillation**: 3 runs
- **Aging**: None
- **Color**: Orange
- **Difficulty**: 6/10 (Medium)
- **Alcohol Content**: 20%
- **Effects**: Weakness (28 seconds), Poison (4 seconds)

#### Fire Whiskey
- **Name**: Powdery Whiskey / Burning Whiskey / Blazing Whiskey
- **Ingredients**: Wheat (10), Blaze Powder (2)
- **Cooking Time**: 12 minutes
- **Distillation**: 3 runs (55 seconds each)
- **Wood Type**: Spruce (4)
- **Aging**: 18 years
- **Color**: Orange
- **Difficulty**: 7/10 (Hard)
- **Alcohol Content**: 28%
- **Drink Message**: You get a burning feeling in your mouth

### Wood Type Reference

When aging your brews, you can use different types of wood. Each wood type is represented by a number:

- **0**: Any wood type
- **1**: Birch
- **2**: Oak
- **3**: Jungle
- **4**: Spruce
- **5**: Acacia
- **6**: Dark Oak
- **7**: Crimson
- **8**: Warped
- **9**: Mangrove
- **10**: Cherry
- **11**: Bamboo
- **12**: Cut Copper
- **13**: Pale Oak

You can also use the wood name directly (e.g., `wood: birch` or `wood: "Dark Oak"`).

### Recipe Tips

- **Quality Matters**: The better you follow the recipe, the higher quality your brew will be
- **Timing is Critical**: Use a clock to monitor brewing times precisely
- **Wood Selection**: Different woods can impart unique flavors to your aged brews
- **Distillation**: More distillation runs create higher alcohol content but require more skill
- **Aging**: Longer aging generally improves flavor but increases the risk of spoilage
- **Experimentation**: Try different ingredient combinations to discover new recipes
