import { state, State } from "g2o-reactive";
import { Color, ColorProvider, is_color_provider } from "./effects/ColorProvider";
import { ViewDOM } from "./Shape";

/**
 * Helps to keep fillColor and strokeColor code DRY as well as defining the protocol
 * fo interacting with ColorProvider(s).
 */
export class ColorManager {
    /**
     * Keep track of color providers that have pending addRef.
     */
    readonly #news: ColorProvider[] = [];
    /**
     * Keep track of color providers that have pending release.
     */
    readonly #olds: ColorProvider[] = [];
    readonly #color: State<Color>;
    #svg: unknown | null = null;
    #viewDOM: ViewDOM | null = null;
    /**
     * The SVG element with the 'fill' or 'stroke' property.
     */
    #hostElement: unknown;
    /**
     * 
     * @param initialValue 
     * @param qualifiedName 
     */
    constructor(initialValue: Color, readonly qualifiedName: 'fill' | 'stroke') {
        this.#color = state(initialValue);
    }
    get(): Color {
        return this.#color.get();
    }
    set(newColor: Color) {
        const oldColor = this.#color.get();
        if (newColor !== oldColor) {
            if (is_color_provider(oldColor)) {
                if (this.#svg) {
                    oldColor.decrementUse(this.#viewDOM, this.#viewDOM.getElementDefs(this.#svg));
                }
                else {
                    this.#olds.push(oldColor);
                }
            }
            if (is_color_provider(newColor)) {
                if (this.#svg) {
                    newColor.incrementUse(this.#viewDOM, this.#viewDOM.getElementDefs(this.#svg));
                }
                else {
                    this.#news.push(newColor);
                }
            }
            this.#color.set(newColor);
        }
    }
    use(viewDOM: ViewDOM, svgElement: unknown, hostElement: unknown): void {
        this.#viewDOM = viewDOM;
        this.#svg = svgElement;
        this.#hostElement = hostElement;
        const defs = this.#viewDOM.getElementDefs(svgElement);
        for (const newColor of this.#news) {
            newColor.incrementUse(this.#viewDOM, defs);
        }
        this.#news.length = 0;
        for (const oldColor of this.#olds) {
            oldColor.decrementUse(this.#viewDOM, defs);
        }
        this.#olds.length = 0;
    }
    update(): void {
        const color = this.#color.get();
        if (typeof color === 'string') {
            this.#viewDOM.setAttribute(this.#hostElement, this.qualifiedName, color);
        }
        else if (is_color_provider(color)) {
            this.#viewDOM.setAttribute(this.#hostElement, this.qualifiedName, color.serialize());
        }
        else {
            this.#viewDOM.removeAttribute(this.#hostElement, this.qualifiedName);
        }
    }
}
