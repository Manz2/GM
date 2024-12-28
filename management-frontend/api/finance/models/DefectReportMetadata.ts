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
import type { DefectReportMetadataFilters } from './DefectReportMetadataFilters';
import {
    DefectReportMetadataFiltersFromJSON,
    DefectReportMetadataFiltersFromJSONTyped,
    DefectReportMetadataFiltersToJSON,
    DefectReportMetadataFiltersToJSONTyped,
} from './DefectReportMetadataFilters';

/**
 * 
 * @export
 * @interface DefectReportMetadata
 */
export interface DefectReportMetadata {
    /**
     * 
     * @type {Date}
     * @memberof DefectReportMetadata
     */
    generatedAt?: Date;
    /**
     * 
     * @type {number}
     * @memberof DefectReportMetadata
     */
    totalDefects?: number;
    /**
     * 
     * @type {DefectReportMetadataFilters}
     * @memberof DefectReportMetadata
     */
    filters?: DefectReportMetadataFilters;
}

/**
 * Check if a given object implements the DefectReportMetadata interface.
 */
export function instanceOfDefectReportMetadata(value: object): value is DefectReportMetadata {
    return true;
}

export function DefectReportMetadataFromJSON(json: any): DefectReportMetadata {
    return DefectReportMetadataFromJSONTyped(json, false);
}

export function DefectReportMetadataFromJSONTyped(json: any, ignoreDiscriminator: boolean): DefectReportMetadata {
    if (json == null) {
        return json;
    }
    return {
        
        'generatedAt': json['generated_at'] == null ? undefined : (new Date(json['generated_at'])),
        'totalDefects': json['total_defects'] == null ? undefined : json['total_defects'],
        'filters': json['filters'] == null ? undefined : DefectReportMetadataFiltersFromJSON(json['filters']),
    };
}

  export function DefectReportMetadataToJSON(json: any): DefectReportMetadata {
      return DefectReportMetadataToJSONTyped(json, false);
  }

  export function DefectReportMetadataToJSONTyped(value?: DefectReportMetadata | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'generated_at': value['generatedAt'] == null ? undefined : ((value['generatedAt']).toISOString()),
        'total_defects': value['totalDefects'],
        'filters': DefectReportMetadataFiltersToJSON(value['filters']),
    };
}

