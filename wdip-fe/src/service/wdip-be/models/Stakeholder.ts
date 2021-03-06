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
 * @interface Stakeholder
 */
export interface Stakeholder {
    /**
     * 
     * @type {string}
     * @memberof Stakeholder
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof Stakeholder
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof Stakeholder
     */
    party: string;
}

export function StakeholderFromJSON(json: any): Stakeholder {
    return {
        'id': json['id'],
        'name': json['name'],
        'party': json['party'],
    };
}

export function StakeholderToJSON(value?: Stakeholder): any {
    if (value === undefined) {
        return undefined;
    }
    return {
        'id': value.id,
        'name': value.name,
        'party': value.party,
    };
}


