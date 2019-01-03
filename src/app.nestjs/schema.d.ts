export interface Schema {
  /**
   * The name of the app.
   */
  name: string;
  /**
   * npm scope - auto detected from nx.json but can specify your own name
   */
  npmScope?: string;
  /**
   * The prefix to apply to generated selectors.
   */
  prefix?: string;
  /**
   * Skip installing dependencies
   */
  skipInstall?: boolean;
  /**
   * Skip formatting files
   */
  skipFormat?: boolean;
}
