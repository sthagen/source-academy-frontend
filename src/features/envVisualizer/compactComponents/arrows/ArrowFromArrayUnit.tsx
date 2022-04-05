import { CompactConfig } from '../../EnvVisualizerCompactConfig';
import { StepsArray } from '../../EnvVisualizerTypes';
import { ArrayValue } from '../values/ArrayValue';
import { FnValue } from '../values/FnValue';
import { GlobalFnValue } from '../values/GlobalFnValue';
import { GenericArrow } from './GenericArrow';

/** this class encapsulates an arrow to be drawn between 2 points */
export class ArrowFromArrayUnit extends GenericArrow {
  protected calculateSteps() {
    const from = this.source;
    const to = this.target;
    if (!to) return [];

    const steps: StepsArray = [
      (x, y) => [x + CompactConfig.DataUnitWidth / 2, y + CompactConfig.DataUnitHeight / 2]
    ];

    if (to instanceof FnValue || to instanceof GlobalFnValue) {
      steps.push((x, y) => [from.x() < to.x() ? to.x() : to.centerX, to.y()]);
    } else if (to instanceof ArrayValue) {
      if (from.y() === to.y()) {
        if (Math.abs(from.x() - to.x()) > CompactConfig.DataUnitWidth * 2) {
          steps.push((x, y) => [x, y - CompactConfig.DataUnitHeight]);
          steps.push((x, y) => [
            to.x() + CompactConfig.DataUnitWidth / 2,
            to.y() - CompactConfig.DataUnitHeight / 2
          ]);
          steps.push((x, y) => [x, y + CompactConfig.DataUnitHeight / 2]);
        } else {
          steps.push((x, y) => [to.x(), to.y() + CompactConfig.DataUnitHeight / 2]);
        }
      } else {
        steps.push((x, y) => [
          to.x() + CompactConfig.DataUnitWidth / 2,
          to.y() + (from.y() > to.y() ? CompactConfig.DataUnitHeight : 0)
        ]);
      }
    } else {
      steps.push((x, y) => [to.x(), to.y()]);
    }

    return steps;
  }
}
