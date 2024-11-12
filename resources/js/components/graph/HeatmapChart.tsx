import React, { useState } from "react";
import { timeDays, timeMonths, timeWeek, timeYear } from "d3-time";
import { Group } from "@visx/group";
import { timeFormat } from "d3-time-format";
import { scaleLinear } from "@visx/scale";
import { useTooltip, useTooltipInPortal } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import cn from "classnames";
import { StravaRun } from "../types/api";
import { ResponsiveContainer } from "./ResponsiveContainer";

const formatDay = timeFormat("%Y-%m-%d");

type Props = {
    data: StravaRun[];
    width?: number;
};

function Calendar({ data, width = 0 }: Props) {
    console.log("Render calendar")
    const formattedData = React.useMemo(() => {
        return data.reduce((acc, run) => {
            const date = formatDay(new Date(run.date));
            if (acc[date] == null) {
                acc[date] = [];
            }
            acc[date].push(run);
            return acc;
        }, {} as Record<string, StravaRun[]>);
    }, [data]);

    const years = React.useMemo(
        () =>
            Object.entries(formattedData).reduce((acc, [day, value]) => {
                const year = day.split("-")[0];
                console.log(year, day);
                if (acc[year] == null) {
                    acc[year] = { totalNumber: 0, totalDistance: 0 };
                }
                acc[year].totalNumber += 1;
                acc[year].totalDistance += value.reduce((acc, run) => acc + run.distance, 0);
                return acc;
            }, {} as Record<string, { totalNumber: number, totalDistance: number }>),
        [data]
    );

    const color = React.useMemo(
        () =>
            scaleLinear()
                .domain([0, 20])
                .range(["#f7cac3", "#BB4636"]),
        [data]
    );

    const outlineWidth = width > 768 ? 4 : 2;
    const cellWidth = (width - outlineWidth) / 53;
    const height = cellWidth * 7;

    const pathMonth = React.useCallback(
        (t0: any) => {
            const d0 = t0.getDay();
            const w0 = timeWeek.count(timeYear(t0), t0);
            const t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0);
            const d1 = t1.getDay();
            const w1 = timeWeek.count(timeYear(t1), t1);

            return `
            M${(w0 + 1) * cellWidth + outlineWidth / 2},${d0 * cellWidth}
            H${w0 * cellWidth + outlineWidth / 2} V${7 * cellWidth}
            H${w1 * cellWidth + outlineWidth / 2} V${(d1 + 1) * cellWidth}
            H${(w1 + 1) * cellWidth + outlineWidth / 2} V0
            H${(w0 + 1) * cellWidth + outlineWidth / 2}Z
        `;
        },
        [cellWidth]
    );

    const options = React.useMemo(
        () =>
            Object.entries(years)
                .sort(([a], [b]) => Number(b) - Number(a))
                .map(([year, count]) => ({ label: year, value: year, count })),
        [years]
    );

    // start with latest year in years selected
    const [selected, setSelected] = useState(options[0]);

    const firstDayOfYear = new Date(Number(selected.value), 0, 1);
    const lastDayOfYear = new Date(Number(selected.value) + 1, 0, 1);
    const yearDays = timeDays(firstDayOfYear, lastDayOfYear);
    const yearMonths = timeMonths(firstDayOfYear, lastDayOfYear);

    const {
        tooltipData,
        tooltipLeft,
        tooltipTop,
        tooltipOpen,
        showTooltip,
        hideTooltip,
    } = useTooltip<{ date: string, formattedDate: string, value: StravaRun[] }>();

    const { containerRef, TooltipInPortal } = useTooltipInPortal({
        detectBounds: true,
        scroll: true,
        debounce: 300,
    });

    const handleMouseOver = React.useCallback(
        (event: React.MouseEvent<SVGGElement, MouseEvent>, date: string, value: StravaRun[]) => {
            const target = event.target as SVGGElement;
            if (target.ownerSVGElement) {
                const coords = localPoint(target.ownerSVGElement, event);
                showTooltip({
                    tooltipLeft: coords?.x,
                    tooltipTop: coords?.y,
                    tooltipData: {
                        // convert to Month Date
                        date,
                        formattedDate: new Date(date).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric"
                        }),
                        value,
                    },
                });
            }
        },
        [showTooltip]
    );

    return (
        <div className="flex h-full w-full flex-col gap-2">
            <svg
                ref={containerRef}
                width={width}
                height={height + outlineWidth}
                key={`year-${selected.value}`}
            >
                <Group
                    transform={`translate(${
                        (width - cellWidth * 53) / 2 - outlineWidth / 2
                    },${height - cellWidth * 7 - 1})`}
                >
                    <Group top={1} className="bg-black">
                        {yearDays.map((day) => {
                            const dayString = formatDay(day);
                            const value = formattedData[dayString];

                            return (
                                <Group
                                    onMouseOver={(event) =>
                                        handleMouseOver(event, dayString, value)
                                    }
                                    onMouseOut={hideTooltip}
                                >
                                    <rect
                                        width={cellWidth}
                                        height={cellWidth}
                                        className={cn({
                                            "fill-white":
                                                tooltipData?.date !== dayString,
                                            "fill-primary":
                                                tooltipData?.date === dayString,
                                        })}
                                        x={
                                            timeWeek.count(timeYear(day), day) *
                                                cellWidth +
                                            outlineWidth / 2
                                        }
                                        y={
                                            day.getDay() * cellWidth +
                                            outlineWidth / 2
                                        }
                                        key={`day-bg-${dayString}`}
                                    />
                                    <rect
                                        fill={(color(value?.reduce((acc, run) => acc + run.distance, 0) / 1000) as string) ?? "#f1f1f1"}
                                        className="hover:brightness-95"
                                        width={cellWidth - outlineWidth}
                                        height={cellWidth - outlineWidth}
                                        x={
                                            timeWeek.count(timeYear(day), day) *
                                                cellWidth +
                                            outlineWidth
                                        }
                                        y={
                                            day.getDay() * cellWidth +
                                            outlineWidth
                                        }
                                        key={`day-rect-${dayString}`}
                                    />
                                </Group>
                            );
                        })}
                    </Group>

                    <Group
                        fill="none"
                        style={{ strokeWidth: outlineWidth }}
                        className="stroke-[#44403C]"
                        top={outlineWidth / 2 + 1}
                    >
                        {yearMonths.map((firstOfMonth) => (
                            <path
                                d={pathMonth(firstOfMonth)}
                                key={`month-path-${formatDay(firstOfMonth)}`}
                            />
                        ))}
                    </Group>
                </Group>
            </svg>
            {tooltipOpen && (
                <TooltipInPortal
                    // set this to random so it correctly updates with parent bounds
                    key={Math.random()}
                    top={tooltipTop}
                    left={tooltipLeft}
                    className="flex flex-col gap-4 !text-black font-geist-mono border-black border shadow-none"
                    detectBounds={true}
                >
                    <div>
                        <span>{tooltipData?.formattedDate}</span>
                        <ul>
                            {tooltipData?.value?.map((run) => (
                                <li key={run.id}>{(run.distance / 1000).toFixed(1)}km</li>
                            ))}
                        </ul>
                    </div>
                </TooltipInPortal>
            )}
        </div>
    );
}

const CalendarMemo = React.memo(Calendar);

export function ResponsiveHeatmapChart({
    data,
    className,
}: Props & { className?: string }) {
    return (
        <ResponsiveContainer className={className}>
            <CalendarMemo data={data} />
        </ResponsiveContainer>
    );
}
