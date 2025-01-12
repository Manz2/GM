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
import type { GmService } from './GmService';
import {
    GmServiceFromJSON,
    GmServiceFromJSONTyped,
    GmServiceToJSON,
    GmServiceToJSONTyped,
} from './GmService';

/**
 * 
 * @export
 * @interface Services
 */
export interface Services {
    /**
     * 
     * @type {GmService}
     * @memberof Services
     */
    financeBackend?: GmService;
    /**
     * 
     * @type {GmService}
     * @memberof Services
     */
    propertyBackend?: GmService;
    /**
     * 
     * @type {GmService}
     * @memberof Services
     */
    parkingBackend?: GmService;
    /**
     * 
     * @type {GmService}
     * @memberof Services
     */
    paymentWatcher?: GmService;
    /**
     * 
     * @type {GmService}
     * @memberof Services
     */
    reportGenerationWorker?: GmService;
    /**
     * 
     * @type {GmService}
     * @memberof Services
     */
    managementFrontend?: GmService;
    /**
     * 
     * @type {GmService}
     * @memberof Services
     */
    parkingFrontend?: GmService;
    /**
     * 
     * @type {GmService}
     * @memberof Services
     */
    propertyDb?: GmService;
    /**
     * 
     * @type {GmService}
     * @memberof Services
     */
    parkingDb?: GmService;
    /**
     * 
     * @type {GmService}
     * @memberof Services
     */
    storage?: GmService;
}

/**
 * Check if a given object implements the Services interface.
 */
export function instanceOfServices(value: object): value is Services {
    return true;
}

export function ServicesFromJSON(json: any): Services {
    return ServicesFromJSONTyped(json, false);
}

export function ServicesFromJSONTyped(json: any, ignoreDiscriminator: boolean): Services {
    if (json == null) {
        return json;
    }
    return {
        
        'financeBackend': json['financeBackend'] == null ? undefined : GmServiceFromJSON(json['financeBackend']),
        'propertyBackend': json['propertyBackend'] == null ? undefined : GmServiceFromJSON(json['propertyBackend']),
        'parkingBackend': json['parkingBackend'] == null ? undefined : GmServiceFromJSON(json['parkingBackend']),
        'paymentWatcher': json['paymentWatcher'] == null ? undefined : GmServiceFromJSON(json['paymentWatcher']),
        'reportGenerationWorker': json['reportGenerationWorker'] == null ? undefined : GmServiceFromJSON(json['reportGenerationWorker']),
        'managementFrontend': json['managementFrontend'] == null ? undefined : GmServiceFromJSON(json['managementFrontend']),
        'parkingFrontend': json['parkingFrontend'] == null ? undefined : GmServiceFromJSON(json['parkingFrontend']),
        'propertyDb': json['propertyDb'] == null ? undefined : GmServiceFromJSON(json['propertyDb']),
        'parkingDb': json['parkingDb'] == null ? undefined : GmServiceFromJSON(json['parkingDb']),
        'storage': json['storage'] == null ? undefined : GmServiceFromJSON(json['storage']),
    };
}

  export function ServicesToJSON(json: any): Services {
      return ServicesToJSONTyped(json, false);
  }

  export function ServicesToJSONTyped(value?: Services | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'financeBackend': GmServiceToJSON(value['financeBackend']),
        'propertyBackend': GmServiceToJSON(value['propertyBackend']),
        'parkingBackend': GmServiceToJSON(value['parkingBackend']),
        'paymentWatcher': GmServiceToJSON(value['paymentWatcher']),
        'reportGenerationWorker': GmServiceToJSON(value['reportGenerationWorker']),
        'managementFrontend': GmServiceToJSON(value['managementFrontend']),
        'parkingFrontend': GmServiceToJSON(value['parkingFrontend']),
        'propertyDb': GmServiceToJSON(value['propertyDb']),
        'parkingDb': GmServiceToJSON(value['parkingDb']),
        'storage': GmServiceToJSON(value['storage']),
    };
}

