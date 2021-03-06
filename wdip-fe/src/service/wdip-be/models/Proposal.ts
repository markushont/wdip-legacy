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
 * @interface Proposal
 */
export interface Proposal {
    /**
     * 
     * @type {string}
     * @memberof Proposal
     */
    wording: string;
    /**
     * 
     * @type {string}
     * @memberof Proposal
     */
    committeeStatus: string;
    /**
     * 
     * @type {string}
     * @memberof Proposal
     */
    chamberStatus: string;
}

export function ProposalFromJSON(json: any): Proposal {
    return {
        'wording': json['wording'],
        'committeeStatus': json['committeeStatus'],
        'chamberStatus': json['chamberStatus'],
    };
}

export function ProposalToJSON(value?: Proposal): any {
    if (value === undefined) {
        return undefined;
    }
    return {
        'wording': value.wording,
        'committeeStatus': value.committeeStatus,
        'chamberStatus': value.chamberStatus,
    };
}


