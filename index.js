/**
 * Created by juice on 11/7/16.
 */

var Screen = require('./screen');

module.exports = function(module_options) {

  var defaultOptions = {
    width: 64,
    height: 32,
    more: ')',
    cursor: '>'
  };

  var options;
  if (module_options)
    options = Object.assign(defaultOptions, module_options);
  else
    options = defaultOptions;

  var screen = Screen(
    options.width,
    options.height,
    options.more,
    options.cursor
  );

  /**
   * Merges next screen onto previous
   * - automatic recognition of last screen merge
   * - automatic management of command prompts
   * @param prev {string} previous screen (or complete response)
   * @param next {string} next screen
   * @returns {string} complete screen
   */
  var mergeResponse = screen.mergeResponse_subst.bind(null, screen.merge_fns.kopernik);

  return {
    mergeResponse: mergeResponse,
    wrapLines: screen.wrapLines,
    hasMore: screen.hasMore,
    lib: {
      merge_fn: screen.merge_fns.kopernik,
      merge_fn_intersects: false

    }
  }
};