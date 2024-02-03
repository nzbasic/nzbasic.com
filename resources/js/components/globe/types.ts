import { GeoPath, GeoPermissibleObjects, GeoProjection } from "d3-geo";
import { Selection } from "d3-selection";
import { Feature as BaseFeature, GeoJsonProperties, Geometry } from "geojson";

// credit: react-d3-globe by sitek94 (MIT License) https://github.com/sitek94/react-d3-globe

// Common types
export type Rotation = [number, number] | [number, number, number];

// Features
export type Feature = BaseFeature<Geometry, GeoJsonProperties>;
export type Features = Feature[];

export interface CountryFeature extends Feature {
    properties: CountryProperties;
}
export type CountriesFeatures = CountryFeature[];

export interface CountryProperties {
    id: string;
    name: string;
    position: Rotation;
    requests: number;
}
export type CountriesProperties = CountryProperties[];

// Globe
export type GlobeProjection = GeoProjection;
export type GlobePathGenerator = GeoPath<any, GeoPermissibleObjects>;

// Selections
export interface SVGDatum {
    width: number;
    height: number;
}
export type CountriesPathsSelection = Selection<
    SVGPathElement,
    CountryFeature,
    SVGSVGElement,
    SVGDatum
>;
export type GlobeCircleSelection = Selection<
    SVGCircleElement,
    SVGDatum,
    null,
    undefined
>;
