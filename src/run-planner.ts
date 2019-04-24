/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import * as turf from '@turf/helpers';
import destination from '@turf/destination';
import * as leaflet from 'leaflet';
// import length from '@turf/length';

import { OpenRouteService } from './openrouteservice';

const here: [number, number] = [-4.2248, 57.4706];

const map = leaflet.map('mapid').setView(leaflet.latLng([here[1],here[0]]), 15);
const stamen = leaflet.tileLayer('http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.',
    // maxZoom: 15
});
map.addLayer(stamen);

const apiKey = 'APIKEYHERE';


function hasDuplicateCoordinates(coords: number[][]): boolean {
    for (let i = 0; i < coords.length; i++) {
        for (let j = 0; j < coords.length; j++) {
            if (coords[i][0] === coords[j][0] && coords[i][1] === coords[j][1] && i < j && i !== 0) {
                return true;
            }
        }
    }
    return false;
}

function findFirstDuplicate(coords: number[][]): any | undefined {
    for (let i = 0; i < coords.length; i++) {
        for (let j = 0; j < coords.length; j++) {
            if (coords[i][0] === coords[j][0] && coords[i][1] === coords[j][1] && i < j && i !== 0) {
                return {first:i, length:j-i};
            }
        }
    }
    return false;
    
}

function simplifyRoute(lineString: turf.Feature<turf.LineString>): void {
    const coords = lineString.geometry.coordinates;
    while (hasDuplicateCoordinates(coords)) {
        const splicer = findFirstDuplicate(coords);
        if (splicer) {
            coords.splice(splicer.first, splicer.length);
        }
    }
}


async function getDirs() {
    const circumference = 5;
    const diameter = circumference / Math.PI;
    const radius = diameter / 2.0;
    console.log(radius);
    
    const pt1 = turf.point(here);
    const pts = [pt1];
    for(let i = 0; i < 360; i += 15) {
        pts.push(destination(pt1, radius, i, {units: "kilometres"}));
    }

    const coords = pts.slice(1).map(pt => pt.geometry.coordinates);
    coords.push(pts[1].geometry.coordinates);

    const router: OpenRouteService = new OpenRouteService(apiKey);
    const route = await router.getDirections(coords);

    const geoLayer = new leaflet.GeoJSON();
    geoLayer.addTo(map);

    pts.forEach(pt => {
        geoLayer.addData(pt);
    })

    route.features.forEach(feature => {
        geoLayer.addData(feature);
    });

    
    route.features.forEach(feature => {
        const lineString: turf.Feature<turf.LineString> = <turf.Feature<turf.LineString>>feature;
        const coords = lineString.geometry.coordinates;

        for (let i = 0; i < coords.length; i++) {
            for (let j = 0; j < coords.length; j++) {
                if (coords[i][0] === coords[j][0] && coords[i][1] === coords[j][1] && i < j && i !== 0) {
                    geoLayer.addData(turf.point(coords[i]));
                }
            }
        }
    });

    /*
    route.features.forEach(feature => {
        const lineString: turf.Feature<turf.LineString> = <turf.Feature<turf.LineString>>feature;
        console.log(length(lineString));
        simplifyRoute(lineString);
        console.log(length(lineString));
        geoLayer.addData(lineString);
    });
    */

}

getDirs();
