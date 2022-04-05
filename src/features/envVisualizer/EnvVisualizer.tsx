import { Context } from 'js-slang';
import React from 'react';

import { Layout } from './EnvVisualizerLayout';

type SetVis = (vis: React.ReactNode) => void;

/** Environment Visualizer is exposed from this class */
export default class EnvVisualizer {
  /** callback function to update the visualization state in the SideContentEnvVis component */
  private static setVis: SetVis;
  private static printableMode: boolean = false;
  private static compactLayout: boolean = true;
  private static context: Context;
  public static togglePrintableMode(): void {
    EnvVisualizer.printableMode = !EnvVisualizer.printableMode;
  }
  public static toggleCompactLayout(): void {
    EnvVisualizer.compactLayout = !EnvVisualizer.compactLayout;
  }
  public static getPrintableMode(): boolean {
    return EnvVisualizer.printableMode;
  }
  public static getCompactLayout(): boolean {
    return EnvVisualizer.compactLayout;
  }

  /** SideContentEnvVis initializes this onMount with the callback function */
  static init(setVis: SetVis, width: number, height: number) {
    Layout.visibleHeight = height;
    Layout.visibleWidth = width;
    this.setVis = setVis;
  }

  static clear() {
    Layout.values.clear();
    Layout.compactValues.clear();
  }

  /** updates the visualization state in the SideContentEnvVis component based on
   * the JS Slang context passed in */
  static drawEnv(context: Context) {
    EnvVisualizer.context = context;
    Layout.currentDark = undefined;
    Layout.currentLight = undefined;
    Layout.currentCompactDark = undefined;
    Layout.currentCompactLight = undefined;
    if (!this.setVis) throw new Error('env visualizer not initialized');

    Layout.setContext(context);
    this.setVis(Layout.draw());

    // icon to blink
    const icon = document.getElementById('env_visualizer-icon');
    icon && icon.classList.add('side-content-tab-alert');
  }

  static redraw() {
    // checks if the required diagram exists, and updates the dom node using setVis
    if (
      EnvVisualizer.getCompactLayout() &&
      EnvVisualizer.getPrintableMode() &&
      Layout.currentCompactLight !== undefined
    ) {
      this.setVis(Layout.currentCompactLight);
    } else if (
      EnvVisualizer.getCompactLayout() &&
      !EnvVisualizer.getPrintableMode() &&
      Layout.currentCompactDark !== undefined
    ) {
      this.setVis(Layout.currentCompactDark);
    } else if (
      !EnvVisualizer.getCompactLayout() &&
      EnvVisualizer.getPrintableMode() &&
      Layout.currentLight !== undefined
    ) {
      this.setVis(Layout.currentLight);
    } else if (
      !EnvVisualizer.getCompactLayout() &&
      !EnvVisualizer.getPrintableMode() &&
      Layout.currentDark !== undefined
    ) {
      this.setVis(Layout.currentDark);
    } else {
      Layout.setContext(EnvVisualizer.context);
      this.setVis(Layout.draw());
    }
    Layout.updateDimensions(Layout.visibleWidth, Layout.visibleHeight);
  }

  static updateDimensions(width: number, height: number) {
    if (Layout.stageRef != null && width !== null && height !== null) {
      Layout.updateDimensions(width, height);
    }
  }
}
