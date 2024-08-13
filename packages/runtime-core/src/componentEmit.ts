export function emit(instance, event, ...arg) {
  const { props } = instance;
  const eventName = `on${event.charAt(0).toUpperCase()}${event.slice(1)}`;
  const fn = props[eventName];
  fn && fn(...arg);
}
