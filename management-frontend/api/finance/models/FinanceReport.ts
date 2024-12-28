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
import type { FinanceReportMetadata } from './FinanceReportMetadata';
import {
    FinanceReportMetadataFromJSON,
    FinanceReportMetadataFromJSONTyped,
    FinanceReportMetadataToJSON,
    FinanceReportMetadataToJSONTyped,
} from './FinanceReportMetadata';

/**
 * 
 * @export
 * @interface FinanceReport
 */
export interface FinanceReport {
    /**
     * 
     * @type {string}
     * @memberof FinanceReport
     */
    reportType?: FinanceReportReportTypeEnum;
    /**
     * 
     * @type {{ [key: string]: any; }}
     * @memberof FinanceReport
     */
    data?: { [key: string]: any; };
    /**
     * 
     * @type {FinanceReportMetadata}
     * @memberof FinanceReport
     */
    metadata?: FinanceReportMetadata;
}


/**
 * @export
 */
export const FinanceReportReportTypeEnum = {
    Revenue: 'revenue',
    Profit: 'profit'
} as const;
export type FinanceReportReportTypeEnum = typeof FinanceReportReportTypeEnum[keyof typeof FinanceReportReportTypeEnum];


/**
 * Check if a given object implements the FinanceReport interface.
 */
export function instanceOfFinanceReport(value: object): value is FinanceReport {
    return true;
}

export function FinanceReportFromJSON(json: any): FinanceReport {
    return FinanceReportFromJSONTyped(json, false);
}

export function FinanceReportFromJSONTyped(json: any, ignoreDiscriminator: boolean): FinanceReport {
    if (json == null) {
        return json;
    }
    return {
        
        'reportType': json['report_type'] == null ? undefined : json['report_type'],
        'data': json['data'] == null ? undefined : json['data'],
        'metadata': json['metadata'] == null ? undefined : FinanceReportMetadataFromJSON(json['metadata']),
    };
}

  export function FinanceReportToJSON(json: any): FinanceReport {
      return FinanceReportToJSONTyped(json, false);
  }

  export function FinanceReportToJSONTyped(value?: FinanceReport | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'report_type': value['reportType'],
        'data': value['data'],
        'metadata': FinanceReportMetadataToJSON(value['metadata']),
    };
}

