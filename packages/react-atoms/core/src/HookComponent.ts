/// <reference types="react" />

export class HookComponent {
  compositions: Array<(...args: any[]) => HookComponent>;
  hookFn: any;

  constructor(
    hookFn: (renderer: () => JSX.Element) => JSX.Element,
    compositions: Array<(...args: any[]) => HookComponent> = []
  ) {
    this.hookFn = hookFn;
    this.compositions = compositions;
  }

  compose(composer: (...args: any[]) => HookComponent) {
    return new HookComponent(this.hookFn, [...this.compositions, composer]);
  }

  private _render(
    renderer: (...args: any[]) => JSX.Element,
    compositions: Array<(...args: any[]) => HookComponent>
  ): JSX.Element {
    if (compositions.length === 0) {
      return this.hookFn(renderer);
    } else {
      return this._render((...args) => {
        const current = compositions[compositions.length - 1];
        return current(...args).render((...args2: any[]) => {
          return renderer(...args, ...args2);
        });
      }, compositions.slice(0, compositions.length - 1));
    }
  }

  render(renderer?: (...args: any[]) => JSX.Element): JSX.Element {
    return this._render(
      renderer || (() => (null as unknown) as JSX.Element),
      this.compositions
    );
  }
}
