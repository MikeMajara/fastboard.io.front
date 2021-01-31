import { Point } from 'paper';

import { drawingsLayers, mapLayers } from '#constants';

import { operations } from './constants';
import {
  resizeItem,
  rotateItem,
  translateItem,
} from './operations';

/**
 * Perform an operation on an item - received from another user.
 *
 * @param {Object} operationData Necessary data for the given operation.
 */
export default function operateItem({ itemName, ...operationData }) {
  const { drawings : drawingsProject, map : mapProject } = this.dependencies.projects;

  const item = {
    drawings : drawingsProject.layers[drawingsLayers.drawings].children[itemName],
    map      : mapProject.layers[mapLayers.drawings].children[itemName],
  };

  if (!item.drawings || !item.map) {
    return;
  }

  switch (operationData.type) {
    case operations.translate:
      translateItem(
        item,
        new Point(operationData.originPoint),
        new Point(operationData.destinationPoint),
      );
      break;

    case operations.resize:
      resizeItem(
        item,
        operationData.originBound,
        new Point(operationData.destinationPoint),
      );
      break;

    case operations.rotate:
      rotateItem(
        item,
        operationData.currentAngle,
        new Point(operationData.destinationPoint),
      );
      break;

    default:
      break;
  }
}
