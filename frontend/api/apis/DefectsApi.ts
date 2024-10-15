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


import * as runtime from '../runtime';
import type {
  Defect,
  ErrorResponse,
} from '../models/index';
import {
    DefectFromJSON,
    DefectToJSON,
    ErrorResponseFromJSON,
    ErrorResponseToJSON,
} from '../models/index';

export interface AddDefectRequest {
    defect: Defect;
}

export interface DeleteDefectRequest {
    id: string;
}

export interface GetDefectByIdRequest {
    id: string;
}

export interface ListDefectsRequest {
    property?: string;
    status?: ListDefectsStatusEnum;
}

export interface UpdateDefectRequest {
    id: string;
    defect: Defect;
}

/**
 * 
 */
export class DefectsApi extends runtime.BaseAPI {

    /**
     * Fügt einen neuen Defect hinzu
     * Defect hinzufügen
     */
    async addDefectRaw(requestParameters: AddDefectRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Defect>> {
        if (requestParameters['defect'] == null) {
            throw new runtime.RequiredError(
                'defect',
                'Required parameter "defect" was null or undefined when calling addDefect().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        const response = await this.request({
            path: `/api/defects`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: DefectToJSON(requestParameters['defect']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => DefectFromJSON(jsonValue));
    }

    /**
     * Fügt einen neuen Defect hinzu
     * Defect hinzufügen
     */
    async addDefect(requestParameters: AddDefectRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Defect> {
        const response = await this.addDefectRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Löscht einen spezifischen Defect anhand der ID
     * Defect löschen
     */
    async deleteDefectRaw(requestParameters: DeleteDefectRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling deleteDefect().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/api/defects/{id}`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Löscht einen spezifischen Defect anhand der ID
     * Defect löschen
     */
    async deleteDefect(requestParameters: DeleteDefectRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.deleteDefectRaw(requestParameters, initOverrides);
    }

    /**
     * Gibt einen spezifischen Defect anhand der ID zurück
     * Defect per ID abrufen
     */
    async getDefectByIdRaw(requestParameters: GetDefectByIdRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Defect>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling getDefectById().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/api/defects/{id}`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => DefectFromJSON(jsonValue));
    }

    /**
     * Gibt einen spezifischen Defect anhand der ID zurück
     * Defect per ID abrufen
     */
    async getDefectById(requestParameters: GetDefectByIdRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Defect> {
        const response = await this.getDefectByIdRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Gibt alle gemeldeten Defects zurück. Optional kann nach Property und Status gefiltert werden.
     * Defects Liste abfragen
     */
    async listDefectsRaw(requestParameters: ListDefectsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<Defect>>> {
        const queryParameters: any = {};

        if (requestParameters['property'] != null) {
            queryParameters['property'] = requestParameters['property'];
        }

        if (requestParameters['status'] != null) {
            queryParameters['status'] = requestParameters['status'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/api/defects`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(DefectFromJSON));
    }

    /**
     * Gibt alle gemeldeten Defects zurück. Optional kann nach Property und Status gefiltert werden.
     * Defects Liste abfragen
     */
    async listDefects(requestParameters: ListDefectsRequest = {}, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<Defect>> {
        const response = await this.listDefectsRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Aktualisiert einen spezifischen Defect anhand der ID
     * Defect aktualisieren
     */
    async updateDefectRaw(requestParameters: UpdateDefectRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Defect>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling updateDefect().'
            );
        }

        if (requestParameters['defect'] == null) {
            throw new runtime.RequiredError(
                'defect',
                'Required parameter "defect" was null or undefined when calling updateDefect().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        const response = await this.request({
            path: `/api/defects/{id}`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
            body: DefectToJSON(requestParameters['defect']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => DefectFromJSON(jsonValue));
    }

    /**
     * Aktualisiert einen spezifischen Defect anhand der ID
     * Defect aktualisieren
     */
    async updateDefect(requestParameters: UpdateDefectRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Defect> {
        const response = await this.updateDefectRaw(requestParameters, initOverrides);
        return await response.value();
    }

}

/**
 * @export
 */
export const ListDefectsStatusEnum = {
    Offen: 'Offen',
    InBearbeitung: 'In-Bearbeitung',
    Geschlossen: 'Geschlossen',
    Abgelehnt: 'Abgelehnt'
} as const;
export type ListDefectsStatusEnum = typeof ListDefectsStatusEnum[keyof typeof ListDefectsStatusEnum];