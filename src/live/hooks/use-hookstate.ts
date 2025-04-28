import { __State, State } from "@hookstate/core";

export function useLiveHookstate<S, E extends object = object>(
  source: __State<S, E>,
): State<S, E> {
  // todo: figure out how to use hookstate with use-gpu
  return source as State<S, E>;
}
