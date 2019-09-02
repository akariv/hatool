export type Meta = {
    key: string,
    value: any
  }[];
export type CBType = (key: string, value: any, record?: any) => void;
export type MetaCBType = (Meta) => void;
export type EventCBType = (string) => void;
