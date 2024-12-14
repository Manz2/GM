/* tslint:disable */
/* eslint-disable */
/**
 * GM-Owner API
 * OpenAPI-Spezifikation der owner-API
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
  ErrorResponse,
  Tenant,
} from '../models/index';
import {
    ErrorResponseFromJSON,
    ErrorResponseToJSON,
    TenantFromJSON,
    TenantToJSON,
} from '../models/index';

export interface AddTenantRequest {
    tenant: Tenant;
}

export interface DeleteTenantRequest {
    id: string;
}

export interface GetTenantByIdRequest {
    id: string;
}

export interface ListTenantsRequest {
    tier?: ListTenantsTierEnum;
}

export interface UpdateTenantRequest {
    id: string;
    tenant: Tenant;
}

/**
 * 
 */
export class TenantsApi extends runtime.BaseAPI {

    /**
     * Fügt einen neuen Tenant hinzu
     * Tenant hinzufügen
     */
    async addTenantRaw(requestParameters: AddTenantRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Tenant>> {
        if (requestParameters['tenant'] == null) {
            throw new runtime.RequiredError(
                'tenant',
                'Required parameter "tenant" was null or undefined when calling addTenant().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("BearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/tenants`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: TenantToJSON(requestParameters['tenant']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => TenantFromJSON(jsonValue));
    }

    /**
     * Fügt einen neuen Tenant hinzu
     * Tenant hinzufügen
     */
    async addTenant(requestParameters: AddTenantRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Tenant> {
        const response = await this.addTenantRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Löscht einen spezifischen Tenant anhand der ID
     * Tenant löschen
     */
    async deleteTenantRaw(requestParameters: DeleteTenantRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling deleteTenant().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("BearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/tenants/{id}`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Löscht einen spezifischen Tenant anhand der ID
     * Tenant löschen
     */
    async deleteTenant(requestParameters: DeleteTenantRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.deleteTenantRaw(requestParameters, initOverrides);
    }

    /**
     * Gibt einen spezifischen Tenant anhand der ID zurück
     * Tenant per ID abrufen
     */
    async getTenantByIdRaw(requestParameters: GetTenantByIdRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Tenant>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling getTenantById().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("BearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/tenants/{id}`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => TenantFromJSON(jsonValue));
    }

    /**
     * Gibt einen spezifischen Tenant anhand der ID zurück
     * Tenant per ID abrufen
     */
    async getTenantById(requestParameters: GetTenantByIdRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Tenant> {
        const response = await this.getTenantByIdRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Gibt alle Tenants zurück. Optional kann nach tier gefiltert werden.
     * Tenant Liste abfragen
     */
    async listTenantsRaw(requestParameters: ListTenantsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<Tenant>>> {
        const queryParameters: any = {};

        if (requestParameters['tier'] != null) {
            queryParameters['tier'] = requestParameters['tier'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("BearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/tenants`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(TenantFromJSON));
    }

    /**
     * Gibt alle Tenants zurück. Optional kann nach tier gefiltert werden.
     * Tenant Liste abfragen
     */
    async listTenants(requestParameters: ListTenantsRequest = {}, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<Tenant>> {
        const response = await this.listTenantsRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Aktualisiert einen spezifischen Tenant anhand der ID
     * Tenant aktualisieren
     */
    async updateTenantRaw(requestParameters: UpdateTenantRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Tenant>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling updateTenant().'
            );
        }

        if (requestParameters['tenant'] == null) {
            throw new runtime.RequiredError(
                'tenant',
                'Required parameter "tenant" was null or undefined when calling updateTenant().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("BearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/tenants/{id}`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
            body: TenantToJSON(requestParameters['tenant']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => TenantFromJSON(jsonValue));
    }

    /**
     * Aktualisiert einen spezifischen Tenant anhand der ID
     * Tenant aktualisieren
     */
    async updateTenant(requestParameters: UpdateTenantRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Tenant> {
        const response = await this.updateTenantRaw(requestParameters, initOverrides);
        return await response.value();
    }

}

/**
 * @export
 */
export const ListTenantsTierEnum = {
    Entry: 'Entry',
    Enhanced: 'Enhanced',
    Premium: 'Premium'
} as const;
export type ListTenantsTierEnum = typeof ListTenantsTierEnum[keyof typeof ListTenantsTierEnum];
