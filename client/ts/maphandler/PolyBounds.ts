import { ReadonlyVec2, vec2 } from "gl-matrix";
import { DVRPCProperties, Point2D } from "../mapdata/mapTypes";
import { polyBoundsCheck } from "./polyBoundsCheck";

export class PolyBounds {
  private points: Array<Array<vec2>>;
  private center: vec2;
  private radius: number;

  readonly props: DVRPCProperties;
  constructor(polys: Array<Array<Point2D>>, props: DVRPCProperties) {
    this.points = polys;
    this.getVertexSphereMap();

    this.props = props;
  }
  
  // generates collision data for an individual poly
  private getVertexSphereMap() {
    let temp = [0, 0] as Array<number> as vec2;
    for (let i = 0; i < this.points[0].length; i++) {
      vec2.add(temp, temp, this.points[0][i]);
    }

    vec2.scale(temp, temp, 1.0 / this.points[0].length);

    this.center = temp;

    temp = [0, 0] as Array<number> as vec2;
    let temp2 = [0, 0] as Array<number> as vec2;
    vec2.copy(temp, this.center);

    let maxLength = 0;
    for (let i = 0; i < this.points[0].length; i++) {
      vec2.sub(temp2, temp, this.points[0][i]);
      maxLength = Math.max(vec2.len(temp2), maxLength);
    }

    this.radius = maxLength;
  }

  /**
   * @returns polygon data for this point.
   */
  getPolyData() {
    return this.points as Array<Array<vec2>>;
  }

  /**
   * Tests a particular point on the map against our collision data.
   * @param latlong - the lat/long point we wish to test
   * @returns true if the point is inside the polygon, false otherwise
   */
  testCollision(latlong: vec2) {
    const temp = [] as Array<number> as vec2;
    if (vec2.length(vec2.sub(temp, latlong, this.center)) > this.radius) {
      // outside of bounding sphere, no chance of a collision -- bail.
      return false;
    }

    // perform a bounds test on poly0
    if (polyBoundsCheck(this.points[0], latlong)) {
      for (let i = 1; i < this.points.length; i++) {
        if (polyBoundsCheck(this.points[i], latlong)) {
          // we're inside a hole -- bail
          return false;
        }
      }
    } else {
      return false;
    }

    return true;
  }
}