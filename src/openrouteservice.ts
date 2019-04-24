/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
 
import * as turf from '@turf/helpers';

export class OpenRouteService {
  private apiKey: string = '';

  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  public async getDirections(coordinates:number[][]): Promise<turf.FeatureCollection> {
    const directionsRequest: Request = new Request('https://api.openrouteservice.org/v2/directions/foot-walking/geojson', {
      method:'POST',
      headers:{
        'Accept': 'application/json, application/geo+json; charset=utf-8',
        'Content-Type': 'application/json',
        'Authorization': this.apiKey
      },
      body: JSON.stringify({coordinates})
    });
    const directionsResponse: Response = await window.fetch(directionsRequest);
    return <turf.FeatureCollection>(await directionsResponse.json());
  }
}