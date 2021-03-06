/*
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 *
 */

var GraphComponent = require('./graph_component');

/**
 * Draws a projected line from an origin
 * to a position that's based on a specified angle
 */
var Guideline = GraphComponent.extend({
  defaults: {
    lineFn: null,
    dataFn: null,
    height: 100,
    offset: 0,
    minPos: -1,
    maxPos: null,
    autoAttach: true,
    position: -90, // Default position
    clock: null, // Clock instance
    cx: null, // X co-ordinate of the start point
    cy: null, // Y co-ordinate of the start point
    classes: { // A set of strings used for adding classes to DOM nodes
      line: 'guideline'
    }
  },
  init: function(options) {
    var _this = this;
    this._super(options);

    _.bindAll(this, 'goToCurrentPosition');

    this.clock = this.config.clock;

    // Set the default radii and origins
    this.__inheritFromBase(['cx', 'cy', 'inner_radius', 'outer_radius']);

    if(this.config.autoAttach) {
      this.attach();
    }
    this.__setPathFromPosition(this.config.position);
    this.currentPosition = this.config.position;
    this.render();

    // Make sure the guideline updates whenever the time is changed.
    $.subscribe(this.clock.channelId + '.timeChange', this.goToCurrentPosition);
  },
  goToCurrentPosition: function(e) {
    this.goToPosition(this.clock.currentAngle);
  },
  /**
   * Recalculate and render the guideline
   * based on a specified co-ordinate
   */
  goToPosition: function(pos) {
    this.__setPathFromPosition(pos);
    this.currentPosition = pos;

    // Add the vectors
    this.v1 = $V([this.guidePoints[0][0], this.guidePoints[0][1], 0]);
    this.v2 = $V([this.guidePoints[1][0] - this.guidePoints[0][0], this.guidePoints[1][1] - this.guidePoints[0][1], 0]);

    this.render();
  },
  __setPathFromPosition: function(pos) {
    // Set the default path data
    var x = _.max([pos, this.config.minPos]);
    if(this.config.maxPos !== null) {
      x = _.min([x, this.config.maxPos]);
    }

    this.guidePoints = [
      [x, 0],
      [x, this.config.height]
    ];
  },
  /**
   * Attach the new SVG nodes to the base element
   */
  attach: function() {
    // Add a new <g> and move it to the specified origin
    this.svgGroup = this.base.svg.append("svg:g")
      .attr("transform", "translate(" + (this.config.cx + this.config.offset) + "," + this.config.cy + ")");

    // Append the <path> inside of the new <g>
    this.svg = this.svgGroup.append('svg:line')
      .attr("class", this.config.classes.line);

  },
  /**
   * Render the attributes for the guideline
   */
  render: function() {
    if(this.svg) {
      this.svg.attr('x1', this.guidePoints[0][0])
      .attr('y1', this.guidePoints[0][1])
      .attr('x2', this.guidePoints[1][0])
      .attr('y2', this.guidePoints[1][1]);
    }
  }
});

module.exports = Guideline;
