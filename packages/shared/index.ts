export const extend = Object.assign;

export const isObject = (val) => val !== null && typeof val === "object";

export const isSameValue = (a, b) => Object.is(a, b);
