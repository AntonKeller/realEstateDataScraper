declare function request(address: any): Promise<any>;
export function get_city_and_street(address: any): Promise<{
    city: any;
    street: any;
    key_unit: any;
} | null>;
export { request as requestByAddress };
