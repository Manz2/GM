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
 * @interface GenerateViewFinanceReport200Response
 */
export interface GenerateViewFinanceReport200Response {
    /**
     * 
     * @type {string}
     * @memberof GenerateViewFinanceReport200Response
     */
    reportUrl?: string;
}

/**
 * Check if a given object implements the GenerateViewFinanceReport200Response interface.
 */
export function instanceOfGenerateViewFinanceReport200Response(value: object): value is GenerateViewFinanceReport200Response {
    return true;
}

export function GenerateViewFinanceReport200ResponseFromJSON(json: any): GenerateViewFinanceReport200Response {
    return GenerateViewFinanceReport200ResponseFromJSONTyped(json, false);
}

export function GenerateViewFinanceReport200ResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): GenerateViewFinanceReport200Response {
    if (json == null) {
        return json;
    }
    return {
        
        'reportUrl': json['report_url'] == null ? undefined : json['report_url'],
    };
}

  export function GenerateViewFinanceReport200ResponseToJSON(json: any): GenerateViewFinanceReport200Response {
      return GenerateViewFinanceReport200ResponseToJSONTyped(json, false);
  }

  export function GenerateViewFinanceReport200ResponseToJSONTyped(value?: GenerateViewFinanceReport200Response | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'report_url': value['reportUrl'],
    };
}

