import { makeContext, useContext, useResource, useState } from '@use-gpu/live';
import { Atom, createStore } from 'jotai';
import { selectAtom } from 'jotai/utils';

export type JotaiStore = ReturnType<typeof createStore>;

type JotaiContextType = {
  store: JotaiStore;
}

export const JotaiContext = makeContext<JotaiContextType>(null);

export function useJotaiStore() {
  const ctx = useContext(JotaiContext);
  if (!ctx) {
    throw new Error('useJotaiStore must be used within a JotaiProvider');
  }

  return ctx.store;
}

export function useAtomValue<V>(atom: Atom<V>) {
  const store = useJotaiStore();

  const [value, setValue] = useState(() => store.get(atom));

  useResource((dispose) => {
    const unsub = store.sub(atom, () => {
      const newValue = store.get(atom);
      setValue(newValue);
    });

    dispose(unsub);
  }, [atom, store]);

  return value;
}

export function useAtomSelector<V, R>(atom: Atom<V>, selector: (value: V) => R) {
  const selectorAtom = selectAtom(atom, selector);
  return useAtomValue(selectorAtom);
}

