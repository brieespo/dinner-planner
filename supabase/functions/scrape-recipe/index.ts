const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { url } = await req.json();
    if (!url) return new Response(JSON.stringify({ error: 'No URL provided' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RecipeScraper/1.0)' } });
    if (!res.ok) return new Response(JSON.stringify({ error: `Could not fetch page (${res.status})` }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const html = await res.text();

    // Extract all JSON-LD blocks
    const jsonLdMatches = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
    let recipe = null;

    for (const match of jsonLdMatches) {
      try {
        const parsed = JSON.parse(match[1].trim());
        const candidates = Array.isArray(parsed) ? parsed : parsed['@graph'] ? parsed['@graph'] : [parsed];
        for (const item of candidates) {
          if (item['@type'] === 'Recipe' || (Array.isArray(item['@type']) && item['@type'].includes('Recipe'))) {
            recipe = item;
            break;
          }
        }
      } catch { /* skip invalid JSON */ }
      if (recipe) break;
    }

    if (!recipe) {
      return new Response(JSON.stringify({ error: 'No structured recipe data found on this page. Try a different recipe site, or enter the recipe manually.' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse cook time (ISO 8601 duration like PT35M or PT1H30M)
    function parseDuration(iso?: string): string {
      if (!iso) return '';
      const h = iso.match(/(\d+)H/)?.[1];
      const m = iso.match(/(\d+)M/)?.[1];
      const mins = (h ? parseInt(h) * 60 : 0) + (m ? parseInt(m) : 0);
      if (!mins) return '';
      if (mins <= 35) return 'quick';
      if (mins <= 60) return 'moderate';
      return 'weekend';
    }

    // Parse ingredients — strip amounts into a separate field
    function parseIngredient(raw: string): { n: string; a: string; c: string } {
      const text = raw.trim();
      // Try to split amount from name: "2 cups flour" -> a:"2 cups", n:"flour"
      const amountMatch = text.match(/^([\d¼½¾⅓⅔⅛⅜⅝⅞\s\/\-–]+(?:cup|cups|tbsp|tsp|tablespoon|tablespoons|teaspoon|teaspoons|oz|ounce|ounces|lb|lbs|pound|pounds|g|gram|grams|kg|ml|liter|liters|can|cans|package|pkg|bunch|head|clove|cloves|slice|slices|sprig|sprigs|inch|in|cm|piece|pieces|large|medium|small|handful)[s]?\.?\s+)?/i);
      let amount = '';
      let name = text;
      if (amountMatch?.[1]) {
        amount = amountMatch[1].trim();
        name = text.slice(amount.length).trim();
      }
      // Guess category by keyword
      const n = name.toLowerCase();
      let c = 'pantry';
      if (/chicken|beef|pork|salmon|shrimp|fish|lamb|turkey|sausage|bacon|steak|tuna|cod|tilapia/.test(n)) c = 'protein';
      else if (/egg|milk|cream|butter|cheese|yogurt|sour cream|buttermilk|mozzarella|parmesan|feta|goat cheese|cheddar|ricotta/.test(n)) c = 'dairy';
      else if (/onion|garlic|tomato|pepper|carrot|celery|spinach|kale|lettuce|arugula|zucchini|eggplant|mushroom|broccoli|asparagus|lemon|lime|orange|apple|potato|sweet potato|corn|pea|green bean|scallion|shallot|ginger|herb|basil|parsley|cilantro|mint|thyme|rosemary|dill|chive|fennel|cauliflower|cucumber|avocado|mango|berry|berries|fruit|vegetable|squash|pumpkin|leek|cabbage|chard|beet|radish|turnip/.test(n)) c = 'produce';
      else if (/frozen/.test(n)) c = 'frozen';
      else if (/tahini|miso|soy sauce|fish sauce|sriracha|harissa|pomegranate|za\'atar|sumac|aleppo|nigella|cardamom|turmeric|cumin|coriander|paprika|saffron|allspice|cayenne|chipotle|ancho|gochujang|mirin|sake|rice vinegar|sesame oil|walnut|almond|pine nut|pistachio|pepperoncini|capers|anchov/.test(n)) c = 'specialty';
      return { n: name, a: amount, c };
    }

    // Parse instructions
    function parseInstructions(raw: unknown): string {
      if (!raw) return '';
      if (typeof raw === 'string') return raw.replace(/<[^>]+>/g, '').trim();
      if (Array.isArray(raw)) {
        return raw.map((step: unknown, i: number) => {
          if (typeof step === 'string') return `Step ${i + 1}: ${step.replace(/<[^>]+>/g, '').trim()}`;
          if (typeof step === 'object' && step !== null) {
            const s = step as Record<string, unknown>;
            const text = (s.text || s.name || '') as string;
            return `Step ${i + 1}: ${text.replace(/<[^>]+>/g, '').trim()}`;
          }
          return '';
        }).filter(Boolean).join('\n');
      }
      return '';
    }

    const rawIngs: string[] = Array.isArray(recipe.recipeIngredient) ? recipe.recipeIngredient : [];
    const parsedIngs = rawIngs.map(parseIngredient).filter(i => i.n);

    const cookTime = parseDuration(recipe.totalTime || recipe.cookTime);

    const result = {
      name: recipe.name || '',
      src: recipe.author
        ? (Array.isArray(recipe.author) ? recipe.author[0]?.name : recipe.author?.name) || new URL(url).hostname.replace('www.', '')
        : new URL(url).hostname.replace('www.', ''),
      url,
      time: cookTime || 'moderate',
      instructions: parseInstructions(recipe.recipeInstructions),
      ings: parsedIngs,
    };

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (e) {
    return new Response(JSON.stringify({ error: `Unexpected error: ${(e as Error).message}` }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
