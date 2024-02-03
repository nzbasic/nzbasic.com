import ColorScale from "color-scales";

const log100Scale = new ColorScale(0, 100, ["#ffffff", "#ffcccc"]);
const log1kScale = new ColorScale(1000, 10000, ["#ffcccc", "#ff9c9c"]);
const log100kScale = new ColorScale(10000, 100000, ["#ffdbdb", "#ff8c8c"]);
const log1MScale = new ColorScale(100000, 1000000, ["#ff8c8c", "#ff0000"]);

export const getColor = (requests: number) => {
    let scale = log100Scale;
    if (requests > 1000 && requests < 10000) {
        scale = log1kScale;
    } else if (requests > 10000 && requests < 100000) {
        scale = log100kScale;
    } else if (requests > 100000) {
        scale = log1MScale;
    }

    return scale.getColor(requests).toHexString();
};
