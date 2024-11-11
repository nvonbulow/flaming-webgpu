import type { LC, LiveElement, ArrowFunction } from '@use-gpu/live';

import { use, memo, gather, unquote, useMemo, useRef, useResource, useState } from '@use-gpu/live';
import { Compute, QueueReconciler, useDeviceContext } from '@use-gpu/workbench';

const {reconcile, quote} = QueueReconciler;

export type ComputeLoopProps = {
  /** Always run initial iteration immediately */
  initial?: boolean,
  /** Loop is running */
  live?: boolean,
  /** Continue iteration count even if program changes */
  continued?: boolean,
  /** Batch # of dispatches together */
  batch?: number,
  /** Limit # of dispatches */
  limit?: number,

  children?: LiveElement<any> | ((tick: number, reset: () => void) => LiveElement<any>);

  then?: (count: number) => LiveElement,
};

export const ComputeLoop: LC<ComputeLoopProps> = memo((props: ComputeLoopProps) => {
  const {
    initial = false,
    live = false,
    continued = false,
    batch = 100,
    limit,
    then,
    children,
  } = props;

  const device = useDeviceContext();

  const countRef = useRef(0);
  const [tick, setTick] = useState(0);

  const resetCount = () => {
    countRef.current = 0;
    setTick(0);
  }

  const childState = typeof children === 'function' ? children(tick, resetCount) : children;

  return (
    reconcile(
      quote(
        gather(
          unquote(use(Compute, { children: childState })),
          (fs: ArrowFunction[]) => {

            useMemo(() => {
              if (!continued) countRef.current = 0;
            }, [continued, ...fs]);

            useResource((dispose) => {
              const isAtLimit = limit != null && countRef.current >= limit;
              let running = live && !isAtLimit;

              const run = () => {
                for (const f of fs) f();
              };

              const runBatch = () => {
                for (let i = 0; i < batch; ++i) run();
                countRef.current += batch;

                if (limit != null && countRef.current >= limit) {
                  running = false;
                }
              };

              if (running) {
                const loop = () => {
                  if (!running) return;

                  runBatch();
                  device.queue.onSubmittedWorkDone().then(() => {
                    setTick(countRef.current);
                    loop();
                  });
                };

                setTimeout(loop, 0);
              }
              else if (initial) {
                run();
              }

              dispose(() => running = false);
            }, [initial, live, batch, ...fs]);

            return then?.(tick);
          }
        )
      )
    )
  );
}, 'CustomComputeLoop');
