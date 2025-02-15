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
import type { Defect } from './Defect';
import {
    DefectFromJSON,
    DefectFromJSONTyped,
    DefectToJSON,
    DefectToJSONTyped,
} from './Defect';
import type { Property } from './Property';
import {
    PropertyFromJSON,
    PropertyFromJSONTyped,
    PropertyToJSON,
    PropertyToJSONTyped,
} from './Property';
import type { DefectReportMetadata } from './DefectReportMetadata';
import {
    DefectReportMetadataFromJSON,
    DefectReportMetadataFromJSONTyped,
    DefectReportMetadataToJSON,
    DefectReportMetadataToJSONTyped,
} from './DefectReportMetadata';

/**
 * 
 * @export
 * @interface DefectReport
 */
export interface DefectReport {
    /**
     * 
     * @type {Array<Property>}
     * @memberof DefectReport
     */
    properties?: Array<Property>;
    /**
     * 
     * @type {Array<Defect>}
     * @memberof DefectReport
     */
    defects?: Array<Defect>;
    /**
     * 
     * @type {DefectReportMetadata}
     * @memberof DefectReport
     */
    metadata?: DefectReportMetadata;
}

/**
 * Check if a given object implements the DefectReport interface.
 */
export function instanceOfDefectReport(value: object): value is DefectReport {
    return true;
}

export function DefectReportFromJSON(json: any): DefectReport {
    return DefectReportFromJSONTyped(json, false);
}

export function DefectReportFromJSONTyped(json: any, ignoreDiscriminator: boolean): DefectReport {
    if (json == null) {
        return json;
    }
    return {
        
        'properties': json['properties'] == null ? undefined : ((json['properties'] as Array<any>).map(PropertyFromJSON)),
        'defects': json['defects'] == null ? undefined : ((json['defects'] as Array<any>).map(DefectFromJSON)),
        'metadata': json['metadata'] == null ? undefined : DefectReportMetadataFromJSON(json['metadata']),
    };
}

  export function DefectReportToJSON(json: any): DefectReport {
      return DefectReportToJSONTyped(json, false);
  }

  export function DefectReportToJSONTyped(value?: DefectReport | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'properties': value['properties'] == null ? undefined : ((value['properties'] as Array<any>).map(PropertyToJSON)),
        'defects': value['defects'] == null ? undefined : ((value['defects'] as Array<any>).map(DefectToJSON)),
        'metadata': DefectReportMetadataToJSON(value['metadata']),
    };
}

