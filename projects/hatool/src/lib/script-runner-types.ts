export type Meta = {
    key: string,
    value: any
  }[];
export type CBType = (key: string, value: any, record?: any) => void;
export type EventCBType = (event: string) => void;
