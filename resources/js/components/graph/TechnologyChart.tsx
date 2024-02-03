import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";
import { Grid } from "@visx/grid";
import { useTooltip, Tooltip } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { voronoi } from "@visx/voronoi";
import React, { useCallback, useRef, useMemo } from "react";
import { TechnologyEnjoyment } from "../types/project";
import { ResponsiveChildProps, ResponsiveContainer } from "./ResponsiveContainer";

type StatamicSkills = {
    logo: {
        url: string;
    },
    title: string;
    enjoyment: number;
    experience: number;
    type: {
        value: 'library' | 'language' | 'framework' | 'other';
        label: string;
    }
}

const x = (d: TechnologyEnjoyment) => d.experience;
const y = (d: TechnologyEnjoyment) => d.enjoyment;

const r = 15;
let tooltipTimeout: number;
let index = 0;

export const ResponsiveTechnologyChart = ({
    data,
    className,
}: { className?: string, data: StatamicSkills[] }) => {
    const converted: TechnologyEnjoyment[] = data.map((d) => ({
        enjoyment: d.enjoyment * 10,
        experience: d.experience * 10,
        title: d.title,
        imageUrl: d.logo.url,
        type: d.type.value,
    }));

    return (
        <ResponsiveContainer className={className}>
            <TechnologyChartMemo data={converted} />
        </ResponsiveContainer>
    );
}

export const TechnologyChart = ({
    data,
    width = 0,
    height = 0,
}: ResponsiveChildProps & { data: TechnologyEnjoyment[] }) => {
    width = Math.max(0, width - 2);
    height = Math.max(0, height - 67)

    const svgRef = useRef<SVGSVGElement>(null);
    const {
        showTooltip,
        hideTooltip,
        tooltipData,
        tooltipOpen,
        tooltipTop = 0,
        tooltipLeft = 0,
    } = useTooltip<TechnologyEnjoyment>();

    const xScale = useMemo(
        () =>
            scaleLinear({
                domain: [0, 110],
                range: [0, width],
                round: true,
            }),
        [width]
    );

    const yScale = useMemo(
        () =>
            scaleLinear({
                domain: [0, 110],
                range: [height, 0],
                round: true,
            }),
        [height]
    );

    const voronoiLayout = useMemo(
        () =>
            voronoi({
                x: (d: TechnologyEnjoyment) => xScale(x(d)) ?? 0,
                y: (d: TechnologyEnjoyment) => yScale(y(d)) ?? 0,
                width,
                height,
            })(data),
        [height, width, xScale, yScale]
    );

    const handleMouseMove = useCallback(
        (event: React.MouseEvent | React.TouchEvent) => {
            if (tooltipTimeout) clearTimeout(tooltipTimeout);
            if (!svgRef.current) return;

            // find the nearest polygon to the current mouse position
            const point = localPoint(svgRef.current, event);
            if (!point) return;
            const closest = voronoiLayout.find(point.x, point.y, 40);
            if (closest) {
                showTooltip({
                    tooltipLeft: xScale(x(closest.data)),
                    tooltipTop: yScale(y(closest.data)),
                    tooltipData: closest.data,
                });
            }
        },
        [showTooltip, voronoiLayout, xScale, yScale]
    );

    const handleMouseLeave = useCallback(() => {
        tooltipTimeout = window.setTimeout(() => {
            hideTooltip();
        }, 250);
    }, [hideTooltip]);

    return (
        <div className="relative grid grid-cols-[58px_1fr] grid-rows-[1fr_58px]">
            <img src="/images/yaxis.svg" className="h-full -ml-[44px]" />
            <svg className="absolute ml-[2px]" width={width} height={height} ref={svgRef}>
                <Grid
                    className="disable-grid-border stroke-gray-200 hide-first"
                    height={height}
                    width={width}
                    xScale={xScale}
                    yScale={yScale}
                    stroke=""
                />

                <rect
                    width={width}
                    height={height}
                    fill="transparent"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onTouchMove={handleMouseMove}
                    onTouchEnd={handleMouseLeave}
                />

                <defs>
                    {data.map(({ imageUrl }, i) => (
                        <React.Fragment key={i}>
                            <pattern
                                id={`img-${i}`}
                                patternUnits="objectBoundingBox"
                                width="100%"
                                height="100%"
                            >
                                <image
                                    className="stroke-blue-500"
                                    href={imageUrl}
                                    width={r * 3}
                                    height={r * 3}
                                />
                            </pattern>
                        </React.Fragment>
                    ))}
                </defs>

                <Group pointerEvents="none">
                    {data.map((point, i) =>
                        <rect
                            key={i}
                            x={xScale(x(point)) - r * 1.5}
                            y={yScale(y(point)) - r * 1.5}
                            width={r * 3}
                            height={r * 3}
                            fill={`url(#img-${i})`}
                            strokeWidth={2}
                        />
                    )}
                </Group>
            </svg>

            <img src="/images/xaxis.svg" className="w-full col-span-full" />

            {tooltipOpen &&
                tooltipData &&
                tooltipLeft != null &&
                tooltipTop != null && (
                    <Tooltip
                        // font is mono, so find length needed to center text
                        left={tooltipLeft}
                        top={tooltipTop}
                        className="border border-black"
                    >
                        <div className="text-black">{tooltipData.title}</div>
                    </Tooltip>
                )}
        </div>

    );
};

export const TechnologyChartMemo = React.memo(TechnologyChart);
