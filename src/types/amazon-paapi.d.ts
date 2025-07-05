declare module 'amazon-paapi' {
  export interface AmazonPaapiParams {
    AccessKey: string
    SecretKey: string
    PartnerTag: string
    PartnerType: string
    Marketplace: string
    Keywords?: string
    SearchIndex?: string
    ItemCount?: number
  }

  export interface ItemInfo {
    Title?: {
      DisplayValue: string
    }
    Features?: {
      DisplayValues: string[]
    }
  }

  export interface Price {
    DisplayAmount: string
  }

  export interface Listing {
    Price?: Price
  }

  export interface Offers {
    Listings?: Listing[]
  }

  export interface Image {
    URL: string
  }

  export interface Images {
    Primary?: {
      Large?: Image
    }
  }

  export interface Item {
    ItemInfo?: ItemInfo
    Offers?: Offers
    Images?: Images
  }

  export interface ItemsResult {
    Items: Item[]
  }

  export interface SearchResult {
    ItemsResult?: ItemsResult
  }

  export class AmazonPaapi {
    static SearchItems(params: AmazonPaapiParams): Promise<SearchResult>
  }
} 