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
 * @interface DefectReportMetadataFilters
 */
export interface DefectReportMetadataFilters {
    /**
     * 
     * @type {string}
     * @memberof DefectReportMetadataFilters
     */
    property?: string;
    /**
     * 
     * @type {string}
     * @memberof DefectReportMetadataFilters
     */
    status?: string;
    /**
     * 
     * @type {Date}
     * @memberof DefectReportMetadataFilters
     */
    startDate?: Date;
    /**
     * 
     * @type {Date}
     * @memberof DefectReportMetadataFilters
     */
    endDate?: Date;
}

/**
 * Check if a given object implements the DefectReportMetadataFilters interface.
 */
export function instanceOfDefectReportMetadataFilters(value: object): value is DefectReportMetadataFilters {
    return true;
}

export function DefectReportMetadataFiltersFromJSON(json: any): DefectReportMetadataFilters {
    return DefectReportMetadataFiltersFromJSONTyped(json, false);
}

export function DefectReportMetadataFiltersFromJSONTyped(json: any, ignoreDiscriminator: boolean): DefectReportMetadataFilters {
    if (json == null) {
        return json;
    }
    return {
        
        'property': json['property'] == null ? undefined : json['property'],
        'status': json['status'] == null ? undefined : json['status'],
        'startDate': json['start_date'] == null ? undefined : (new Date(json['start_date'])),
        'endDate': json['end_date'] == null ? undefined : (new Date(json['end_date'])),
    };
}

  export function DefectReportMetadataFiltersToJSON(json: any): DefectReportMetadataFilters {
      return DefectReportMetadataFiltersToJSONTyped(json, false);
  }

  export function DefectReportMetadataFiltersToJSONTyped(value?: DefectReportMetadataFilters | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'property': value['property'],
        'status': value['status'],
        'start_date': value['startDate'] == null ? undefined : ((value['startDate']).toISOString().substring(0,10)),
        'end_date': value['endDate'] == null ? undefined : ((value['endDate']).toISOString().substring(0,10)),
    };
}

