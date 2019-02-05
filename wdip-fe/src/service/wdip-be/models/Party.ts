// tslint:disable
/**
 * WDIP
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * OpenAPI spec version: 0.0.1
 * Contact: markus@silberstein.nu
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists } from '../runtime';
/**
 * 
 * @export
 * @interface Party
 */
export interface Party {
    /**
     * 
     * @type {string}
     * @memberof Party
     */
    id: string;
    /**
     * 
     * @type {number}
     * @memberof Party
     */
    x: number;
    /**
     * 
     * @type {number}
     * @memberof Party
     */
    y: number;
    /**
     * 
     * @type {string}
     * @memberof Party
     */
    color: string;
    /**
     * 
     * @type {string}
     * @memberof Party
     */
    name: string;
}

export function PartyFromJSON(json: any): Party {
    return {
        'id': json['id'],
        'x': json['x'],
        'y': json['y'],
        'color': json['color'],
        'name': json['name'],
    };
}

export function PartyToJSON(value?: Party): any {
    if (value === undefined) {
        return undefined;
    }
    return {
        'id': value.id,
        'x': value.x,
        'y': value.y,
        'color': value.color,
        'name': value.name,
    };
}

