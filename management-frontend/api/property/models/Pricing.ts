/* tslint:disable */
/* eslint-disable */
/**
 * GM Properties API
 * OpenAPI-Spezifikation der GM Properties-API
 *
 * The version of the OpenAPI document: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface Pricing
 */
export interface Pricing {
    /**
     * Preis für die erste Stunde
     * @type {number}
     * @memberof Pricing
     */
    firstHour?: number;
    /**
     * Stundenpreis nach erster Stunde
     * @type {number}
     * @memberof Pricing
     */
    hourly?: number;
    /**
     * Tagespreis
     * @type {number}
     * @memberof Pricing
     */
    daily?: number;
}

/**
 * Check if a given object implements the Pricing interface.
 */
export function instanceOfPricing(value: object): value is Pricing {
    return true;
}

export function PricingFromJSON(json: any): Pricing {
    return PricingFromJSONTyped(json, false);
}

export function PricingFromJSONTyped(json: any, ignoreDiscriminator: boolean): Pricing {
    if (json == null) {
        return json;
    }
    return {
        
        'firstHour': json['firstHour'] == null ? undefined : json['firstHour'],
        'hourly': json['hourly'] == null ? undefined : json['hourly'],
        'daily': json['daily'] == null ? undefined : json['daily'],
    };
}

  export function PricingToJSON(json: any): Pricing {
      return PricingToJSONTyped(json, false);
  }

  export function PricingToJSONTyped(value?: Pricing | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'firstHour': value['firstHour'],
        'hourly': value['hourly'],
        'daily': value['daily'],
    };
}

