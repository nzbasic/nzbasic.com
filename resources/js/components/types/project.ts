export interface ProjectData {
  name: string,
  icon: string,
  description: string,
  uni?: boolean,
  technologies: string[],
  website: boolean,
  users?: string,
  link: string,
  repo: string,
  longDescription: string,
  story?: string,
  challenges?: string,
  learned?: string,
  improvements?: string,
  comments?: string,
  features: string[],
  screenshots: Screenshot[]
}

export interface Screenshot {
  title: string,
  link: string
}

export interface ImageData {
  width: number;
  height: number;
  src: string;
  media: string;
}

const sm = "(min-width: 640px)"
const md = "(min-width: 768px)"
const lg = "(min-width: 1024px)"
const xl = "(min-width: 1280px)"
const xl2 = "(min-width: 1536px)"

export const MediaSize = {
  sm,
  md,
  lg,
  xl,
  xl2,
}

export interface ImagePreviewContent {
  title: string;
  dark: ImageData[];
  light: ImageData[];
}

export interface Technology {
  title: string;
  imageUrl: string;
  type: "library" | "framework" | "language" | "other";
  background?: string;
}

export interface TechnologyEnjoyment extends Technology {
  experience: number;
  enjoyment: number;
  circle?: true;
}
