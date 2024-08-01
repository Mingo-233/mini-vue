export function shouldUpdateComponent(prevVNode, nextVNode) {
  const { props: prevProp } = prevVNode;
  const { props: nextProp } = nextVNode;
  for (const key in prevProp) {
    if (prevProp[key] !== nextProp[key]) return true;
  }

  return false;
}
