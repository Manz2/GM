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
 * Property
 * @export
 * @interface ParkingProperty
 */
export interface ParkingProperty {
    /**
     * Id
     * @type {string}
     * @memberof ParkingProperty
     */
    id?: string;
    /**
     * availableSpace
     * @type {number}
     * @memberof ParkingProperty
     */
    availableSpace?: number;
    /**
     * leftSpace
     * @type {number}
     * @memberof ParkingProperty
     */
    occupiedSpace?: number;
}

/**
 * Check if a given object implements the ParkingProperty interface.
 */
export function instanceOfParkingProperty(value: object): value is ParkingProperty {
    return true;
}

export function ParkingPropertyFromJSON(json: any): ParkingProperty {
    return ParkingPropertyFromJSONTyped(json, false);
}

export function ParkingPropertyFromJSONTyped(json: any, ignoreDiscriminator: boolean): ParkingProperty {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'availableSpace': json['availableSpace'] == null ? undefined : json['availableSpace'],
        'occupiedSpace': json['occupiedSpace'] == null ? undefined : json['occupiedSpace'],
    };
}

  export function ParkingPropertyToJSON(json: any): ParkingProperty {
      return ParkingPropertyToJSONTyped(json, false);
  }

  export function ParkingPropertyToJSONTyped(value?: ParkingProperty | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': value['id'],
        'availableSpace': value['availableSpace'],
        'occupiedSpace': value['occupiedSpace'],
    };
}

