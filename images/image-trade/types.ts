export type LabeledHandle = {
  handle: string
  label: string
}

type MarketAvailability = {
  available: boolean
  in_stock: boolean
  currency: string | null
  price: number | null
  compare_at_price: number | null
  is_on_sale: boolean
}

export type RoughTradeProduct = {
  schema_version: number
  product: {
    id: string
    title: string
    handle: string
    vendor: string
    product_type: string
    artist_primary: string
    image: string
  }
  variant: {
    id: string
    title: string
    sku: string
    barcode: string
    image: string | null
  }
  taxonomy: {
    artists: LabeledHandle[]
    labels: LabeledHandle[]
    genres: LabeledHandle[]
    collections: LabeledHandle[]
  }
  attributes: {
    format: string | null
    colour_swatch: string | null
    colour_group: string | null
  }
  markets: Record<string, MarketAvailability>
  availability: {
    status: string
    release_date: string | null
  }
  objectID: string
}

export type RoughTradeSearchResponse = {
  results: Array<{
    hits: RoughTradeProduct[]
  }>
}
