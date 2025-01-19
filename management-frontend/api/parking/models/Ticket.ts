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
 * Ein Parkticket
 * @export
 * @interface Ticket
 */
export interface Ticket {
    /**
     * Id
     * @type {string}
     * @memberof Ticket
     */
    id?: string;
    /**
     * Das Parkhaus zu dem das Ticket gelöst wurde
     * @type {string}
     * @memberof Ticket
     */
    propertyId?: string;
    /**
     * Datum der Ticket Erstellung
     * @type {number}
     * @memberof Ticket
     */
    creationDate?: number;
    /**
     * Datum der Ticket Bezahlung
     * @type {number}
     * @memberof Ticket
     */
    payDate?: number;
    /**
     * Status halt
     * @type {string}
     * @memberof Ticket
     */
    status?: TicketStatusEnum;
    /**
     * der Preis
     * @type {number}
     * @memberof Ticket
     */
    price?: number;
}


/**
 * @export
 */
export const TicketStatusEnum = {
    Offen: 'Offen',
    Bezahlt: 'Bezahlt'
} as const;
export type TicketStatusEnum = typeof TicketStatusEnum[keyof typeof TicketStatusEnum];


/**
 * Check if a given object implements the Ticket interface.
 */
export function instanceOfTicket(value: object): value is Ticket {
    return true;
}

export function TicketFromJSON(json: any): Ticket {
    return TicketFromJSONTyped(json, false);
}

export function TicketFromJSONTyped(json: any, ignoreDiscriminator: boolean): Ticket {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'propertyId': json['propertyId'] == null ? undefined : json['propertyId'],
        'creationDate': json['creation_date'] == null ? undefined : json['creation_date'],
        'payDate': json['pay_date'] == null ? undefined : json['pay_date'],
        'status': json['status'] == null ? undefined : json['status'],
        'price': json['price'] == null ? undefined : json['price'],
    };
}

  export function TicketToJSON(json: any): Ticket {
      return TicketToJSONTyped(json, false);
  }

  export function TicketToJSONTyped(value?: Ticket | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': value['id'],
        'propertyId': value['propertyId'],
        'creation_date': value['creationDate'],
        'pay_date': value['payDate'],
        'status': value['status'],
        'price': value['price'],
    };
}

