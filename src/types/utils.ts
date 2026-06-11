export type Nullable<T> = T | null;

export type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

export type Prettify<T> = { [K in keyof T]: T[K] } & {};
