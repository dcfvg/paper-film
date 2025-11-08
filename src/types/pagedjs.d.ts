declare module 'pagedjs' {
  export class Previewer {
    constructor();
    preview(content?: string | HTMLElement, stylesheets?: string[], renderTo?: HTMLElement): Promise<void>;
  }

  export class Polyfill {
    constructor();
    setup(): Promise<void>;
  }

  export class Handler {
    constructor();
  }
}
