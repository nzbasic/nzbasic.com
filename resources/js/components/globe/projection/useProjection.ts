import * as React from "react";
import { geoOrthographic, geoPath, select } from "d3";
import { dragBehaviour, rotateProjectionTo } from "./transformations";
import {
    CountriesFeatures,
    CountryFeature,
    Rotation,
    SVGDatum,
} from "../types";

// credit: react-d3-globe by sitek94 (MIT License) https://github.com/sitek94/react-d3-globe

export interface ProjectionConfig {
    svgRef: React.RefObject<SVGSVGElement>;
    countries: CountriesFeatures;
    scale: number;
    cx: number;
    cy: number;
    rotateX?: number;
    rotateY?: number;
    rotateZ?: number;
    rotation?: Rotation;
    dragSensitivity?: number;
    minScroll?: number;
    maxScroll?: number;
}

export function useProjection(props: ProjectionConfig) {
    const {
        svgRef,
        countries,

        // Size
        scale,
        cx,
        cy,

        // Rotation
        rotateX = 250,
        rotateY = 0,
        rotateZ = 0,
        rotation = [rotateX, rotateY, rotateZ],

        // Interactivity
        dragSensitivity = 75,
        minScroll = 0.3,
        maxScroll = 20,
    } = props;

    // Projection
    const projection = React.useMemo(
        () =>
            geoOrthographic()
                .scale(scale)
                .center([0, 0])
                .rotate(rotation)
                .translate([cx, cy]),
        [scale, rotation, cx, cy]
    );

    // Path generator
    const pathGenerator = React.useMemo(
        () => geoPath(projection),
        [projection]
    );

    // Update `path` when `pathGenerator` changes
    React.useEffect(() => {
        if (!svgRef.current || !countries.length) {
            return;
        }

        const svg = select<SVGSVGElement, SVGDatum>(svgRef.current);
        const countriesPaths = svg.selectAll<SVGPathElement, CountryFeature>(
            "path"
        );
        const globeCircle = svg.select<SVGCircleElement>("circle");

        const countriesDataJoin = countriesPaths.data(countries).join("path");

        // Apply drag
        svg.call(
            dragBehaviour({
                selection: countriesDataJoin,
                pathGenerator,
                projection,
                sensitivity: dragSensitivity,
            })
        );

        globeCircle.attr("r", projection.scale());

        if (!document.getElementById("globe-tooltip")) {
            select("#content")
                .append("div")
                .attr("id", "globe-tooltip")
                .style("font-family", '"GeistMono", monospace')
                .style("height", 0)
                .style("visibility", "hidden")
                .style("position", "fixed")
                .style("bottom", "50px")
                .style("background-color", "white")
                .style("border", "1px solid black")
                .style("border-radius", "5px")
                .style("padding", "5px")
                .style("pointer-events", "none")
                .style("z-index", 100)
                .text("");
        }

        const tooltip = select("#globe-tooltip");

        svg.on("mouseover", () =>
            svg?.node()?.setAttribute("animate", "false")
        );
        svg.on("mouseout", () => {
            svg?.node()?.setAttribute("animate", "true");
            tooltip.style("visibility", "hidden");
        });
        svg.on("mousemove", (d: any) => {
            const target = d.target as HTMLElement;

            if (target.classList.contains("country")) {
                const country = target.getAttribute("aria-label") ?? "Unknown";
                const requests = target.getAttribute("aria-valuetext") ?? "0";

                tooltip.html(`Country: ${country}<br>Requests: ${requests}`);
                tooltip.style("visibility", "visible");
                tooltip.style("bottom", null);
                tooltip.style("height", null);
                tooltip.style("left", `${d.clientX + 10}px`);
                tooltip.style("top", `${d.clientY + 10}px`);
            } else {
                tooltip.style("visibility", "hidden");
                tooltip.style("bottom", "50px");
                tooltip.style("height", 0);
                tooltip.html("");
            }
        });

        countriesDataJoin.attr("d", pathGenerator);
        svg.node()?.setAttribute("animate", "true");
    }, [
        svgRef,
        scale,
        maxScroll,
        minScroll,
        projection,
        countries,
        pathGenerator,
        dragSensitivity,
    ]);

    // animation
    React.useEffect(() => {
        if (!svgRef.current) return;

        const svg = select(svgRef.current);
        const countriesPaths = svg.selectAll<SVGPathElement, CountryFeature>(
            "path"
        );
        const countriesDataJoin = countriesPaths.data(countries).join("path");

        const id = setInterval(() => {
            const doAnimation = svg.node()?.getAttribute("animate");
            if (doAnimation === "true") {
                const [x, y] = projection.rotate();
                projection.rotate([x - 0.25, y + 0]);
                pathGenerator.projection(projection);
                countriesDataJoin.attr("d", pathGenerator);
            }
        }, 25);

        return () => clearInterval(id);
    }, [pathGenerator, projection, countries, svgRef]);

    function rotateTo(rotation: Rotation) {
        if (!svgRef.current) {
            return;
        }
        const svg = select(svgRef.current);
        const countriesPaths = svg.selectAll<SVGPathElement, CountryFeature>(
            "path"
        );

        rotateProjectionTo({
            selection: countriesPaths,
            projection,
            pathGenerator,
            rotation,
        });
    }

    return {
        rotateTo,
    };
}
