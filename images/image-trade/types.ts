type LabeledHandle = {
  handle: string
  label: string
}

type MarketPrice = {
  price: number
  compare_at_price: number | null
  is_on_sale: boolean
}

type SearchMatchResult = {
  value: string
  matchLevel: string
  matchedWords: string[]
}

export type RoughTradeProduct = {
  price: number
  compare_at_price: number
  price_ratio: number
  price_range: string
  variants_min_price: number
  variants_max_price: number
  variants_compare_at_price_min: number | null
  variants_compare_at_price_max: number | null
  id: number
  product_type: string
  vendor: string
  title: string
  handle: string
  template_suffix: string
  product_image: string
  tags: string[]
  named_tags: Record<string, unknown>
  named_tags_names: string[]
  _tags: string[]
  meta: {
    custom: {
      colour_swatch?: string
      customer_limit?: number
      eu_in_stock?: string
      exclusive?: string
      format?: string
      gb_in_stock?: string
      is_pre_order?: string
      manual_regional_availability?: string[]
      release_date?: string
      us_in_stock?: string
    }
    shopify: Record<string, string>
  }
  sku: string
  variant_title: string
  variants_count: number
  barcode: string
  position: number
  requires_shipping: boolean
  taxable: boolean
  body_html_safe: string
  image: string
  inventory_policy: string
  inventory_quantity: number
  inventory_available: boolean
  grams: number
  weight: string
  variants_inventory_count: number
  option_names: string[]
  options: Record<string, string>
  option1: string | null
  option2: string | null
  option3: string | null
  created_at: string
  updated_at: string
  published_at: string
  collections: string[]
  collection_ids: number[]
  category: {
    lvl0: string
    lvl1: string
    lvl2: string
  }
  genres: LabeledHandle[]
  artists: LabeledHandle[]
  labels: LabeledHandle[]
  collection: LabeledHandle[]
  multibuy: unknown | null
  market_pricing: {
    gbp: MarketPrice
    usd: MarketPrice
    eur: MarketPrice
  }
  unavailable_markets: string[]
  release_date_unix: number
  added: number
  is_pre_order: boolean
  recently_ordered_count: number
  objectID: string
  _snippetResult: {
    body_html_safe: {
      value: string
      matchLevel: string
    }
  }
  _highlightResult: {
    id: SearchMatchResult
    product_type: SearchMatchResult
    vendor: SearchMatchResult
    title: SearchMatchResult
    meta: {
      custom: {
        format: SearchMatchResult
      }
    }
    sku: SearchMatchResult
    barcode: SearchMatchResult
    inventory_policy: SearchMatchResult
    collections: SearchMatchResult[]
  }
}

export type RoughTradeSearchResponse = {
  results: Array<{
    hits: RoughTradeProduct[]
  }>
}
