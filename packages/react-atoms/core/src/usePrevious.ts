import { useRef } from "./Ref";
import { useEffect } from "./Effect";

export function usePrevious(value: any) {
  return useRef(undefined).compose(ref =>
    useEffect(() => {
      ref.current = value;
    })
  );
}
