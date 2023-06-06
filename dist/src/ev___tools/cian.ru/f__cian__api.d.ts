export function get_cian_regions(page: any): Promise<any>;
export function get_cian_cities(page: any, region_id: any): Promise<any>;
export function get_cian_districts(page: any, city_id: any): Promise<any>;
export function cian_page_links_generator(page: any, url?: null): Promise<never[] | {
    offers_count: any;
    pages_count: number;
    links: string[];
}>;
export function load_offers_from_page(page: any, url?: null): Promise<any>;
export function search_district_id(obj: any, name: any, children_feld: any): any;
export function moskow_okrug_short(word: any): string | null;
