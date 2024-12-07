import React, { useRef } from "react";
import { ResponsiveContainer } from "./ResponsiveContainer";
import { BarGroupHorizontal, Bar } from '@visx/shape';
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { Group } from "@visx/group";
import { AxisLeft } from '@visx/axis';

type Props = {
    data: {
        logo: {
            url: string;
        };
        title: string;
        type: string;
        enjoyment: number;
        experience: number;
    }[]
};

export function EnjoymentChart({
    data,
    width = 0,
}: Props & { width?: number, height?: number }) {
    const gap = 2;
    const groupHeight = 40;

    const height = data.length * groupHeight + gap * (data.length - 1);
    const margin = { top: 0, right: 0, bottom: 0, left: 140 };

    const nameScale = scaleBand({
        domain: data.map(d => d.title),
        padding: 0.2,
        range: [0, height],
    })
    const typeScale = scaleBand({
        domain: ['experience', 'enjoyment'],
        range: [0, nameScale.bandwidth()],
    });
    const valueScale = scaleLinear({
        domain: [0, 10],
        range: [0, width],
    });
    const colorScale = scaleOrdinal<string, string>({
        domain: ['experience', 'enjoyment'],
        range: ['#44403C', '#CA685B'],
    });

    return (
        <div className="relative">
            <svg width={width} height={height}>
                <Group left={margin.left}>
                    <BarGroupHorizontal
                        data={data}
                        keys={['enjoyment', 'experience']}
                        height={height}
                        width={width}
                        y0={d => d.title}
                        y0Scale={nameScale}
                        y1Scale={typeScale}
                        xScale={valueScale}
                        color={colorScale}

                    >
                        {(barGroups) => (
                            barGroups.map(barGroup => (
                                <Group
                                    key={`bar-group-${barGroup.index}`}
                                    top={barGroup.y0}
                                >
                                    {barGroup.bars.map(bar => (
                                        <Bar
                                            key={`bar-group-bar-${bar.index}-${bar.key}`}
                                            x={bar.x}
                                            y={bar.y}
                                            width={bar.width}
                                            height={bar.height}
                                            fill={bar.color}
                                            className="rounded-r"
                                        />
                                    ))}
                                </Group>
                            ))
                        )}
                    </BarGroupHorizontal>
                    <AxisLeft
                        scale={nameScale}
                        hideAxisLine
                        tickFormat={(value) => value.toString()}
                        tickLineProps={{ visibility: "hidden" }}
                        tickComponent={({ formattedValue, ...tickProps }) => {
                            const matched = data.find(d => d.title === formattedValue);
                            const width = 24;

                            return (
                                <svg x={0} y="0.25em" fontSize="10" className="overflow-visible">
                                    <image y={tickProps.y - width / 2} x={- margin.left} href={matched?.logo.url} width={width} height={width} />
                                    <text {...tickProps} dy="0.25em" fontSize="12" fontFamily="GeistMono">
                                        <tspan>{formattedValue}</tspan>
                                    </text>
                                </svg>
                            )
                        }}
                    />
                </Group>
            </svg>
        </div>
    );
}

export const EnjoymentChartMemo = React.memo(EnjoymentChart);

export const ResponsiveEnjoymentChart = ({
    data,
    className,
}: Props & { className?: string }) => {
    return (
        <ResponsiveContainer className={className}>
            <EnjoymentChartMemo data={data} />
        </ResponsiveContainer>
    );
}
