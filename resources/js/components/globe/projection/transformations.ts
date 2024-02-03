import { interpolate, select, Selection } from "d3";
import { D3DragEvent, drag } from "d3-drag";
import {
    CountriesPathsSelection,
    GlobePathGenerator,
    GlobeProjection,
    Rotation,
    SVGDatum,
} from "../types";

// credit: react-d3-globe by sitek94 (MIT License) https://github.com/sitek94/react-d3-globe

interface Helper {
    selection: CountriesPathsSelection;
    projection: GlobeProjection;
    pathGenerator: GlobePathGenerator;
}

interface RotateProjectionToParams extends Helper {
    rotation: Rotation;
    duration?: number;
}

/**
 * A function that makes a transition from current projection.rotation to
 * given rotation
 */
export function rotateProjectionTo({
    selection,
    projection,
    pathGenerator,
    duration = 1000,
    rotation,
}: RotateProjectionToParams) {
    // Store the current rotation value
    const currentRotation = projection.rotate();

    // Update path generator with new projection
    pathGenerator.projection(projection);

    // Set next rotation
    const nextRotation = rotation;

    // Create interpolator function - that will make the transition from
    // current rotation to the next rotation
    const r = interpolate(currentRotation, nextRotation);

    // Update selection
    selection
        // @ts-ignore
        .transition()
        .attrTween("d", (d) => (t) => {
            projection.rotate(r(Math.pow(t, 0.33)));
            pathGenerator.projection(projection);

            // When interpolator returns null, Chrome throws errors for
            // <path> with attribute d="null"
            const pathD = pathGenerator(d);
            return pathD !== null ? pathD : "";
        })
        .duration(duration);
}

interface DragBehaviourParams extends Helper {
    sensitivity: number;
}

/**
 * Drag behaviour
 */
export function dragBehaviour({
    selection,
    projection,
    pathGenerator,
    sensitivity,
}: DragBehaviourParams) {
    return drag<SVGSVGElement, SVGDatum>().on(
        "drag",
        (event: D3DragEvent<SVGSVGElement, SVGDatum, SVGDatum>) => {
            const [rotationX, rotationY] = projection.rotate();
            const k = sensitivity / projection.scale();

            // Update projection
            projection.rotate([
                rotationX + event.dx * k,
                rotationY - event.dy * k,
            ]);

            pathGenerator.projection(projection);
            selection.attr("d", pathGenerator);
            select("#globe-tooltip").style("visibility", "hidden");
        }
    );
}
