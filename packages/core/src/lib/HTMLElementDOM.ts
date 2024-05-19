import { ElementDOM } from "./ElementDOM";

export class HTMLElementDOM implements ElementDOM<HTMLElement, HTMLCanvasElement | SVGElement> {
    addEventListener(target: HTMLElement, name: "resize", callback: () => void): void {
        target.addEventListener(name, callback);
    }
    appendChild(parent: HTMLElement, child: HTMLCanvasElement | SVGElement): void {
        parent.appendChild(child);
    }
    getAttribute(element: HTMLElement, name: string): string {
        return element.getAttribute(name);
    }
    getBoundingClientRect(element: HTMLElement): { width: number; height: number; } {
        return element.getBoundingClientRect();
    }
    getElementById(elementId: string): HTMLElement {
        return document.getElementById(elementId);
    }
    isDocumentBody(element: HTMLElement): boolean {
        return element === document.body;
    }
    removeEventListener(target: HTMLElement, name: "resize", callback: () => void): void {
        target.removeEventListener(name, callback);
    }
}