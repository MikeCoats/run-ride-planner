/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import * as turf from '@turf/helpers';
import destination from '@turf/destination';
import * as leaflet from 'leaflet';
import { process } from 'process';
import { OpenRouteService } from './openrouteservice';

const here: [number, number] = [-4.2248, 57.4776];

const circumference = 5.0;
const diameter = circumference / Math.PI;
const radius = diameter / 2.0;
console.log(radius);

const pt1 = turf.point(here);
const pts = [pt1];
for(let i = 0; i < 360; i += 15) {
    pts.push(destination(pt1, radius, i, {units: "kilometres"}));
}

const map = leaflet.map('mapid').setView(leaflet.latLng([here[1],here[0]]), 15);
const stamen = leaflet.tileLayer('http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.',
    maxZoom: 15
});
map.addLayer(stamen);

const geoLayer = new leaflet.GeoJSON();
geoLayer.addTo(map);

const coords = pts.slice(1).map(pt => pt.geometry.coordinates);
coords.push(pts[1].geometry.coordinates);

const apiKey = 'APIKEYHERE';

async function getDirs() {
    const router: OpenRouteService = new OpenRouteService(apiKey);
    const route = await router.getDirections(coords);
    console.log(route);
    route.features.forEach(feature => {
        geoLayer.addData(feature);
    });
}

getDirs();