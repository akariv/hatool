export type Meta = {
    key: string,
    value: any
  }[];
export type CBType = (string, any) => void;
export type MetaCBType = (Meta) => void;
export type EventCBType = (string) => void;
