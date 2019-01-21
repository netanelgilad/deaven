export class HookComponent {
  compositions: Array<(...args: any[]) => HookComponent>;
  hookFn: any;

  constructor(
    hookFn: ((renderer: () => JSX.Element | null) => JSX.Element | null),
    compositions: Array<(...args: any[]) => HookComponent> = []
  ) {
    this.hookFn = hookFn;
    this.compositions = compositions;
  }

  compose(composer: (...args: any[]) => HookComponent) {
    return new HookComponent(this.hookFn, [...this.compositions, composer]);
  }

  private _render(
    renderer: (...args: any[]) => JSX.Element | null,
    compositions: Array<(...args: any[]) => HookComponent>
  ): JSX.Element | null {
    if (compositions.length === 0) {
      return this.hookFn(renderer);
    } else {
      return this._render((...args) => {
        const current = compositions[compositions.length - 1];
        const current = compositions[0];
        return current(...args).render((...args2: any[]) => {
          return renderer(...args, ...args2);
        });
      }, compositions.slice(0, compositions.length - 1));
      }, compositions.slice(1));
    }
  }

  render(
    renderer?: (...args: any[]) => JSX.Element | null
  ): JSX.Element | null {
    return this._render(renderer || (() => null), this.compositions);
  }
}
