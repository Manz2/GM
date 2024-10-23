/* tslint:disable */
/* eslint-disable */
/**
 * GM Defects API
 * OpenAPI-Spezifikation der GM Defects-API
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
 * Defect am Parkhaus
 * @export
 * @interface Defect
 */
export interface Defect {
    /**
     * Id
     * @type {string}
     * @memberof Defect
     */
    id?: string;
    /**
     * Das Parkhaus
     * @type {string}
     * @memberof Defect
     */
    property?: string;
    /**
     * Ort des Defects im Parkhaus
     * @type {string}
     * @memberof Defect
     */
    location?: string;
    /**
     * Kurzbeschreibung des Schadens
     * @type {string}
     * @memberof Defect
     */
    descriptionShort?: string;
    /**
     * Detaillierte Beschreibung des Schadens
     * @type {string}
     * @memberof Defect
     */
    descriptionDetailed?: string;
    /**
     * Datum der Schadensmeldung
     * @type {number}
     * @memberof Defect
     */
    reportingDate?: number;
    /**
     * Bild des Schadens
     * @type {string}
     * @memberof Defect
     */
    image?: string;
    /**
     * Detaillierte Beschreibung des Schadens
     * @type {string}
     * @memberof Defect
     */
    status?: DefectStatusEnum;
}


/**
 * @export
 */
export const DefectStatusEnum = {
    Offen: 'Offen',
    InBearbeitung: 'In-Bearbeitung',
    Geschlossen: 'Geschlossen',
    Abgelehnt: 'Abgelehnt'
} as const;
export type DefectStatusEnum = typeof DefectStatusEnum[keyof typeof DefectStatusEnum];


/**
 * Check if a given object implements the Defect interface.
 */
export function instanceOfDefect(value: object): value is Defect {
    return true;
}

export function DefectFromJSON(json: any): Defect {
    return DefectFromJSONTyped(json, false);
}

export function DefectFromJSONTyped(json: any, ignoreDiscriminator: boolean): Defect {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'property': json['property'] == null ? undefined : json['property'],
        'location': json['location'] == null ? undefined : json['location'],
        'descriptionShort': json['description_short'] == null ? undefined : json['description_short'],
        'descriptionDetailed': json['description_detailed'] == null ? undefined : json['description_detailed'],
        'reportingDate': json['reporting_date'] == null ? undefined : json['reporting_date'],
        'image': json['image'] == null ? undefined : json['image'],
        'status': json['status'] == null ? undefined : json['status'],
    };
}

  export function DefectToJSON(json: any): Defect {
      return DefectToJSONTyped(json, false);
  }

  export function DefectToJSONTyped(value?: Defect | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': value['id'],
        'property': value['property'],
        'location': value['location'],
        'description_short': value['descriptionShort'],
        'description_detailed': value['descriptionDetailed'],
        'reporting_date': value['reportingDate'],
        'image': value['image'],
        'status': value['status'],
    };
}

