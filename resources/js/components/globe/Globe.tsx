import React from "react";

import { CountryFeature, CountryProperties, Features, Rotation } from "./types";
import { useProjection } from "./projection/useProjection";
import {
    ResponsiveChildProps,
    ResponsiveContainer,
} from "../graph/ResponsiveContainer";
import { getColor } from "./color";
import { FeatureCollection } from "geojson";
import { feature } from "topojson-client";
import { Topology } from "topojson-specification";
import { CFAnalytics } from '../types/api';
// credit: react-d3-globe by sitek94 (MIT License) https://github.com/sitek94/react-d3-globe

interface GlobeProps extends ResponsiveChildProps {
    analytics: CFAnalytics['countries'];
    topology: Topology;
}

export const Globe = ({
    analytics,
    topology,
    width = 400,
    height = 400,
}: GlobeProps) => {
    const countries: CountryFeature[] | null = React.useMemo(() => {
        const topCountries = topology.objects.countries;
        const { features } = feature(
            topology,
            topCountries
        ) as FeatureCollection;

        return features.map((feature) => {
            const countryProps = analytics.find(
                (c) => c.id === Number(feature.id)
            );

            const properties: CountryProperties = countryProps
                ? {
                      id: countryProps.id.toString(),
                      name: countryProps.name ?? '',
                      position: [countryProps.latitude, countryProps.longitude],
                      requests: countryProps.requests,
                  }
                : notFoundCountry;

            return {
                ...feature,
                properties,
            };
        });
    }, [analytics, topology]);

    const size = Math.max(0, width - 4);
    const cx = width / 2;
    const cy = height / 2;
    const r = Math.max(0, size / 2 - 2);

    const svgRef = React.useRef<SVGSVGElement>(null);
    const { rotateTo } = useProjection({
        cx,
        cy,
        scale: size / 2,
        svgRef,
        countries,
    });

    const handleCountryClick = (country: CountryFeature) => {
        rotateTo(country.properties.position);
    };

    return (
        <svg ref={svgRef} width={width} height={height} className="globe">
            <circle
                cx={cx}
                cy={cy}
                r={r}
                className="fill-function stroke-black stroke-2"
            />
            {countries.map((country) => (
                <g key={country.id}>
                    <path
                        aria-valuetext={country.properties.requests.toLocaleString()}
                        aria-label={country.properties.name}
                        style={{ fill: getColor(country.properties.requests) }}
                        className={`country ${country.properties.name} stroke-black hover:stroke-red-700`}
                        onClick={() => handleCountryClick(country)}
                    />
                </g>
            ))}
        </svg>
    );
};

const GlobeMemo = React.memo(Globe);

interface ResponsiveGlobeProps {
    countries: CFAnalytics['countries'];
    topology: Topology;
    className?: string;
}

const bermudaTrianglePosition: Rotation = [
    25.027684437991375, -70.99627570018042,
];

export const notFoundCountry: CountryProperties = {
    id: "unknown",
    name: "unknown",
    position: bermudaTrianglePosition,
    requests: 0,
};

export const ResponsiveGlobe = ({
    countries,
    topology,
    className,
}: ResponsiveGlobeProps) => {
    return (
        <ResponsiveContainer className={className}>
            <GlobeMemo analytics={countries} topology={topology} />
        </ResponsiveContainer>
    );
};
