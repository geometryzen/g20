import { Anchor } from '../anchor.js';
import { Color } from '../effects/ColorProvider.js';
import { Flag } from '../Flag.js';
import { IBoard } from '../IBoard.js';
import { G20 } from '../math/G20.js';
import { Path, PathAttributes } from '../path.js';
import { PositionLike } from '../Shape.js';
import { HALF_PI, TWO_PI } from '../utils/math.js';
import { Commands } from '../utils/path-commands.js';

const cos = Math.cos, sin = Math.sin;

export interface EllipseAttributes {
    id?: string;
    fill?: Color;
    fillOpacity?: number;
    position?: PositionLike;
    attitude?: G20;
    rx?: number;
    ry?: number;
    stroke?: Color;
    strokeOpacity?: number;
    strokeWidth?: number;
    resolution?: number;
    visibility?: 'visible' | 'hidden' | 'collapse';
}

export class Ellipse extends Path {

    _flagWidth = false;
    _flagHeight = false;

    _width = 0;
    _height = 0;

    constructor(board: IBoard, attributes: EllipseAttributes = {}) {

        // At least 2 vertices are required for proper circlage
        const amount = attributes.resolution ? Math.max(attributes.resolution, 2) : 4;
        const points = [];
        for (let i = 0; i < amount; i++) {
            points.push(new Anchor(G20.vector(0, 0)));
        }

        super(board, points, true, true, true, path_attribs_from_ellipse_attribs(attributes));

        if (typeof attributes.rx === 'number') {
            this.width = attributes.rx * 2;
        }
        else {
            this.width = 1;
        }

        if (typeof attributes.ry === 'number') {
            this.height = attributes.ry * 2;
        }
        else {
            this.height = 1;
        }

        this.flagReset(true);

        this.update();
    }

    static Properties = ['width', 'height'];

    override update(): this {
        if (this.zzz.flags[Flag.Vertices] || this._flagWidth || this._flagHeight) {

            let length = this.vertices.length;

            if (!this.closed && length > 2) {
                length -= 1;
            }

            // Coefficient for approximating circular arcs with Bezier curves
            const c = (4 / 3) * Math.tan(Math.PI / (this.vertices.length * 2));
            const radiusX = this._width / 2;
            const radiusY = this._height / 2;

            for (let i = 0; i < this.vertices.length; i++) {
                const pct = i / length;
                const theta = pct * TWO_PI;

                const x = radiusX * cos(theta);
                const y = radiusY * sin(theta);

                const lx = radiusX * c * cos(theta - HALF_PI);
                const ly = radiusY * c * sin(theta - HALF_PI);

                const rx = radiusX * c * cos(theta + HALF_PI);
                const ry = radiusY * c * sin(theta + HALF_PI);

                const v = this.vertices.getAt(i);

                v.command = i === 0 ? Commands.move : Commands.curve;
                v.origin.set(x, y);
                v.controls.a.set(lx, ly);
                v.controls.b.set(rx, ry);
            }
        }

        super.update();
        return this;

    }

    override flagReset(dirtyFlag = false): this {
        this._flagWidth = dirtyFlag;
        this._flagHeight = dirtyFlag;
        super.flagReset(dirtyFlag);
        return this;
    }
    get height() {
        return this._height;
    }
    set height(v) {
        this._height = v;
        this._flagHeight = true;
    }
    get width() {
        return this._width;
    }
    set width(v) {
        this._width = v;
        this._flagWidth = true;
    }
}

function path_attribs_from_ellipse_attribs(attributes: EllipseAttributes): PathAttributes {
    const retval: PathAttributes = {
        id: attributes.id,
        fill: attributes.fill,
        fillOpacity: attributes.fillOpacity,
        attitude: attributes.attitude,
        position: attributes.position,
        stroke: attributes.stroke,
        strokeOpacity: attributes.strokeOpacity,
        strokeWidth: attributes.strokeWidth,
        visibility: attributes.visibility
    };
    return retval;
}
