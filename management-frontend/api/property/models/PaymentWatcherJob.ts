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
 * @interface PaymentWatcherJob
 */
export interface PaymentWatcherJob {
    /**
     * Der zu prüfende Mailserver
     * @type {string}
     * @memberof PaymentWatcherJob
     */
    targetMail?: string;
    /**
     * Credentials
     * @type {string}
     * @memberof PaymentWatcherJob
     */
    credentials?: string;
    /**
     * Sender der Rechnung
     * @type {string}
     * @memberof PaymentWatcherJob
     */
    sender?: string;
    /**
     * Schlüsselwörter
     * @type {Array<string>}
     * @memberof PaymentWatcherJob
     */
    keywords?: Array<string>;
}

/**
 * Check if a given object implements the PaymentWatcherJob interface.
 */
export function instanceOfPaymentWatcherJob(value: object): value is PaymentWatcherJob {
    return true;
}

export function PaymentWatcherJobFromJSON(json: any): PaymentWatcherJob {
    return PaymentWatcherJobFromJSONTyped(json, false);
}

export function PaymentWatcherJobFromJSONTyped(json: any, ignoreDiscriminator: boolean): PaymentWatcherJob {
    if (json == null) {
        return json;
    }
    return {
        
        'targetMail': json['targetMail'] == null ? undefined : json['targetMail'],
        'credentials': json['credentials'] == null ? undefined : json['credentials'],
        'sender': json['sender'] == null ? undefined : json['sender'],
        'keywords': json['keywords'] == null ? undefined : json['keywords'],
    };
}

  export function PaymentWatcherJobToJSON(json: any): PaymentWatcherJob {
      return PaymentWatcherJobToJSONTyped(json, false);
  }

  export function PaymentWatcherJobToJSONTyped(value?: PaymentWatcherJob | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'targetMail': value['targetMail'],
        'credentials': value['credentials'],
        'sender': value['sender'],
        'keywords': value['keywords'],
    };
}

