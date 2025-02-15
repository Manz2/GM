/* tslint:disable */
/* eslint-disable */
/**
 * GM Parking API
 * OpenAPI-Spezifikation der GM Parking-API
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
 * @interface Customisation
 */
export interface Customisation {
    /**
     * name der application
     * @type {string}
     * @memberof Customisation
     */
    applicationName?: string;
    /**
     * Background image
     * @type {string}
     * @memberof Customisation
     */
    backgroundImage?: string;
    /**
     * color Scheme der Anwendung
     * @type {string}
     * @memberof Customisation
     */
    colorScheme?: string;
}

/**
 * Check if a given object implements the Customisation interface.
 */
export function instanceOfCustomisation(value: object): value is Customisation {
    return true;
}

export function CustomisationFromJSON(json: any): Customisation {
    return CustomisationFromJSONTyped(json, false);
}

export function CustomisationFromJSONTyped(json: any, ignoreDiscriminator: boolean): Customisation {
    if (json == null) {
        return json;
    }
    return {
        
        'applicationName': json['applicationName'] == null ? undefined : json['applicationName'],
        'backgroundImage': json['backgroundImage'] == null ? undefined : json['backgroundImage'],
        'colorScheme': json['colorScheme'] == null ? undefined : json['colorScheme'],
    };
}

  export function CustomisationToJSON(json: any): Customisation {
      return CustomisationToJSONTyped(json, false);
  }

  export function CustomisationToJSONTyped(value?: Customisation | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'applicationName': value['applicationName'],
        'backgroundImage': value['backgroundImage'],
        'colorScheme': value['colorScheme'],
    };
}

