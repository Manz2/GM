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
import type { Services } from './Services';
import {
    ServicesFromJSON,
    ServicesFromJSONTyped,
    ServicesToJSON,
    ServicesToJSONTyped,
} from './Services';
import type { Customisation } from './Customisation';
import {
    CustomisationFromJSON,
    CustomisationFromJSONTyped,
    CustomisationToJSON,
    CustomisationToJSONTyped,
} from './Customisation';

/**
 * Tenant der Anwendung
 * @export
 * @interface GmTenant
 */
export interface GmTenant {
    /**
     * Id
     * @type {string}
     * @memberof GmTenant
     */
    id?: string;
    /**
     * Der Name des Tenant
     * @type {string}
     * @memberof GmTenant
     */
    name?: string;
    /**
     * Abo Stufe des Tenant
     * @type {string}
     * @memberof GmTenant
     */
    tier?: GmTenantTierEnum;
    /**
     * Die Mail des Administrators
     * @type {string}
     * @memberof GmTenant
     */
    adminMail?: string;
    /**
     * 
     * @type {Services}
     * @memberof GmTenant
     */
    services?: Services;
    /**
     * 
     * @type {Customisation}
     * @memberof GmTenant
     */
    customisation?: Customisation;
    /**
     * bevorzugte Region des Tenant
     * @type {string}
     * @memberof GmTenant
     */
    preferedRegion?: string;
}


/**
 * @export
 */
export const GmTenantTierEnum = {
    Entry: 'ENTRY',
    Enhanced: 'ENHANCED',
    Premium: 'PREMIUM'
} as const;
export type GmTenantTierEnum = typeof GmTenantTierEnum[keyof typeof GmTenantTierEnum];


/**
 * Check if a given object implements the GmTenant interface.
 */
export function instanceOfGmTenant(value: object): value is GmTenant {
    return true;
}

export function GmTenantFromJSON(json: any): GmTenant {
    return GmTenantFromJSONTyped(json, false);
}

export function GmTenantFromJSONTyped(json: any, ignoreDiscriminator: boolean): GmTenant {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'name': json['name'] == null ? undefined : json['name'],
        'tier': json['tier'] == null ? undefined : json['tier'],
        'adminMail': json['adminMail'] == null ? undefined : json['adminMail'],
        'services': json['services'] == null ? undefined : ServicesFromJSON(json['services']),
        'customisation': json['customisation'] == null ? undefined : CustomisationFromJSON(json['customisation']),
        'preferedRegion': json['prefered-region'] == null ? undefined : json['prefered-region'],
    };
}

  export function GmTenantToJSON(json: any): GmTenant {
      return GmTenantToJSONTyped(json, false);
  }

  export function GmTenantToJSONTyped(value?: GmTenant | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': value['id'],
        'name': value['name'],
        'tier': value['tier'],
        'adminMail': value['adminMail'],
        'services': ServicesToJSON(value['services']),
        'customisation': CustomisationToJSON(value['customisation']),
        'prefered-region': value['preferedRegion'],
    };
}
