export * from "../src/shapeFlags";

export const extend = Object.assign;

export const isObject = (val) => val !== null && typeof val === "object";

export const isString = (val) => typeof val === "string";
export const isSameValue = (a, b) => Object.is(a, b);

export const hasOwn = (val, key) =>
  Object.prototype.hasOwnProperty.call(val, key);

export const isEmptyObject = (val) => Reflect.ownKeys(val).length === 0;

export const EMPTY_OBJ = {};

export function toDisplayString(val) {
  // return Object.prototype.toString.call(val);
  return String(val);
}
