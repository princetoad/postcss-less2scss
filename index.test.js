let postcss = require('postcss')
let less = require('postcss-less')
let stringify = less.stringifier

let plugin = require('./')

function run (input, output, opts) {
  return postcss([plugin(opts)])
    .process(input, { syntax: less, stringifier: stringify })
    .then(result => {
      // expect(result.css).toEqual(output);
      expect(result.content).toEqual(output)
      expect(result.warnings()).toHaveLength(0)
    })
}

/* eslint-disable max-len */
//
// variables
//
/**
 * variables
 */
it('variables - declaration outof any rules', () => {
  let input = '@link-color: #428bca;'
  let output = '$link-color: #428bca;'
  return run(input, output, {})
})

it('variables - declaration inside nested rules', () => {
  let input = `
        #main {
          @width: 5em;
          width: @width;
        }
    `
  let output = `
        #main {
          $width: 5em;
          width: $width;
        }
    `
  return run(input, output, {})
})

it('variables - reference as a single value or part of a value', () => {
  let input = `
        @text-color: @gray-dark;
        @link-color-hover:  darken(@link-color, 10%);
    `
  let output = `
        $text-color: $gray-dark;
        $link-color-hover:  darken($link-color, 10%);
    `
  return run(input, output, {})
})

it('variables - reference in nested rules', () => {
  let input = `
        a:hover {
          color: @link-color-hover;
        }
    `
  let output = `
        a:hover {
          color: $link-color-hover;
        }
    `
  return run(input, output, {})
})

it('variables - declaration & reference', () => {
  let input = `
        // Variables
        @link-color:        #428bca; // sea blue
        @link-color-hover:  darken(@link-color, 10%);
        
        // Usage
        a,
        .link {
          color: @link-color;
        }
        a:hover {
          color: @link-color-hover;
        }
        .widget {
          color: #fff;
          background: @link-color;
        }
    `
  let output = `
        // Variables
        $link-color:        #428bca; // sea blue
        $link-color-hover:  darken($link-color, 10%);
        
        // Usage
        a,
        .link {
          color: $link-color;
        }
        a:hover {
          color: $link-color-hover;
        }
        .widget {
          color: #fff;
          background: $link-color;
        }
    `
  return run(input, output, {})
})

it('variables - multiple variables usage', () => {
  let input = `
        .button-size(@padding-vertical; @padding-horizontal; @font-size; @line-height; @border-radius) {
          padding: @padding-vertical @padding-horizontal;
          font-size: @font-size;
          line-height: @line-height;
          border-radius: @border-radius;
        }
    `
  let output = `
        @mixin button-size($padding-vertical, $padding-horizontal, $font-size, $line-height, $border-radius) {
          padding: $padding-vertical $padding-horizontal;
          font-size: $font-size;
          line-height: $line-height;
          border-radius: $border-radius;
        }
    `
  return run(input, output, {})
})

it('variables - do not convert at-rule: @charset', () => {
  let input = '@charset "utf-8";'
  return run(input, input, {})
})

// it('variables - dont convert at-rule: @import', () => {
//     var input = `
//         @import url("fineprint.css") print;
//         @import url("bluish.css") projection, tv;
//         @import 'custom.css';
//         @import url("chrome://communicator/skin/");
//         @import "common.css" screen, projection;
//         @import url('landscape.css') screen and (orientation:landscape);
//     `;
//     return run(input, input, {});
// });

it('variables - dont convert at-rule: @namespace', () => {
  let input = `
        @namespace url(http://www.w3.org/1999/xhtml);
        @namespace svg url(http://www.w3.org/2000/svg);
        
        a {}
        
        /* This matches all SVG <a> elements */
        svg|a {}
        
        /* This matches both XHTML and SVG <a> elements */
        *|a {}
    `
  return run(input, input, {})
})

it('variables - dont convert at-rule: @media', () => {
  let input = `
        /* Media query */
        @media screen and (min-width: 900px) {
          article {
            padding: 1rem 3rem;
          }
        }
        
        /* Nested media query */
        @supports (display: flex) {
          @media screen and (min-width: 900px) {
            article {
              display: flex;
            }
          }
        }
    `
  return run(input, input, {})
})

it('variables - dont convert at-rule: @support', () => {
  let input = `
        @supports (display: grid) {
          div {
            display: grid;
          }
        }
                
        @supports not (display: grid) {
          div {
            float: right;
          }
        }
    `
  return run(input, input, {})
})

it('variables - dont convert at-rule: @document', () => {
  let input = `
        @document url("https://www.example.com/") {
          h1 {
            color: green;
          }
        }
    `
  return run(input, input, {})
})

it('variables - dont convert at-rule: @page', () => {
  let input = `
        @page {
          margin: 1cm;
        }
        
        @page :first {
          margin: 2cm;
        }
    `
  return run(input, input, {})
})

it('variables - dont convert at-rule: @font-face', () => {
  let input = `
        @font-face {
          font-family: "Open Sans";
          src: url("/fonts/OpenSans-Regular-webfont.woff2") format("woff2"),
               url("/fonts/OpenSans-Regular-webfont.woff") format("woff");
        }
    `
  return run(input, input, {})
})

it('variables - dont convert at-rule: @keyframes', () => {
  let input = `
        @keyframes slidein {
          from {
            margin-left: 100%;
            width: 300%;
          }
        
          to {
            margin-left: 0%;
            width: 100%;
          }
        }
    `
  return run(input, input, {})
})

it('variables - dont convert at-rule: @viewport', () => {
  let input = `
        @viewport {
          width: device-width;
        }
    `
  return run(input, input, {})
})

it('variables - dont convert at-rule: @counter-style', () => {
  let input = `
        @counter-style thumbs {
          system: cyclic;
          symbols: "\\1F44D";
          suffix: " ";
        }
        
        ul {
          list-style: thumbs;
        }
    `
  return run(input, input, {})
})

it('variables - dont convert at-rule: @font-feature-values', () => {
  let input = `
        /* At-rule for "nice-style" in Font One */
        @font-feature-values Font One {
          @styleset {
            nice-style: 12;
          }
        }
        
        /* At-rule for "nice-style" in Font Two */
        @font-feature-values Font Two {
          @styleset {
            nice-style: 4;
          }
        } 
        
        …
        
        /* Apply the at-rules with a single declaration */
        .nice-look {
          font-variant-alternates: styleset(nice-style);
        }
    `
  return run(input, input, {})
})

it('variables - dont convert @plugin At-rules of Less', () => {
  let input = `
        @plugin "my-plugin";
        .show-me-pi {
          value: pi();
        }
        .el-1 {
            @plugin "lib1";
            value: foo();
        }
        .el-2 {
            @plugin "lib2";
            value: foo();
        }
    `
  return run(input, input, {})
})

it('variable interpolation - Selectors', () => {
  let input = `
        // Variables
        @my-selector: banner;
        
        // Usage
        .@{my-selector} {
          font-weight: bold;
          line-height: 40px;
          margin: 0 auto;
        }
    `
  let output = `
        // Variables
        $my-selector: banner;
        
        // Usage
        .#{$my-selector} {
          font-weight: bold;
          line-height: 40px;
          margin: 0 auto;
        }
    `
  return run(input, output, {})
})

it('variable interpolation - for at-rule, such as @media', () => {
  let input = `
        @screen-sm:                  768px;
        @screen-sm-min:              @screen-sm;
        
        .form-inline {
        
          // Kick in the inline
          @media (min-width: @screen-sm-min) {
            // Inline-block all the things for "inline"
            .form-group {
              display: inline-block;
              margin-bottom: 0;
              vertical-align: middle;
            }
          }
        }
    `
  let output = `
        $screen-sm:                  768px;
        $screen-sm-min:              $screen-sm;
        
        .form-inline {
        
          // Kick in the inline
          @media (min-width: $screen-sm-min) {
            // Inline-block all the things for "inline"
            .form-group {
              display: inline-block;
              margin-bottom: 0;
              vertical-align: middle;
            }
          }
        }
    `
  return run(input, output, {})
})

//
// mixin
//
/**
 * Real world example from bootstrap:
 * https://github.com/twbs/bootstrap/blob/v3.4.0-dev/less/mixins/alerts.less
 */
it('mixin - definition', () => {
  let input = `
        .alert-variant(@background; @border; @text-color) {
          background-color: @background;
          border-color: @border;
          color: @text-color;
        
          hr {
            border-top-color: darken(@border, 5%);
          }
          .alert-link {
            color: darken(@text-color, 10%);
          }
        }
    `
  let output = `
        @mixin alert-variant($background, $border, $text-color) {
          background-color: $background;
          border-color: $border;
          color: $text-color;
        
          hr {
            border-top-color: darken($border, 5%);
          }
          .alert-link {
            color: darken($text-color, 10%);
          }
        }
    `
  return run(input, output, {})
})

it('mixin - definition without params', () => {
  let input = `
        .center-block() {
          display: block;
          margin-left: auto;
          margin-right: auto;
        }
    `
  let output = `
        @mixin center-block() {
          display: block;
          margin-left: auto;
          margin-right: auto;
        }
    `
  return run(input, output, {})
})

it('mixin - usage without parenthesis and parameters', () => {
  let input = `
        .a {
            .center-block;
        }
    `
  let output = `
        .a {
            @include center-block;
        }
    `
  return run(input, output, {})
})

it('mixin - usage with parenthesis', () => {
  let input = `
        .a {
            .center-block();
        }
    `
  let output = `
        .a {
            @include center-block();
        }
    `
  return run(input, output, {})
})

it('mixin - mixin usage - with parenthesis and parameters(convert spin to adjust_hue at the same time)', () => {
  let input = `
        @border-radius-base:        4px;
        
        //== Form states and alerts
        //
        //## Define colors for form feedback states and, by default, alerts.
        
        @state-success-text:             #3c763d;
        @state-success-bg:               #dff0d8;
        @state-success-border:           darken(spin(@state-success-bg, -10), 5%);
        
        @state-info-text:                #31708f;
        @state-info-bg:                  #d9edf7;
        @state-info-border:              darken(spin(@state-info-bg, -10), 7%);
        
        @state-warning-text:             #8a6d3b;
        @state-warning-bg:               #fcf8e3;
        @state-warning-border:           darken(spin(@state-warning-bg, -10), 5%);
        
        @state-danger-text:              #a94442;
        @state-danger-bg:                #f2dede;
        @state-danger-border:            darken(spin(@state-danger-bg, -10), 5%);
        
        //## Define alert colors, border radius, and padding.
        
        @alert-padding:               15px;
        @alert-border-radius:         @border-radius-base;
        @alert-link-font-weight:      bold;
        
        @alert-success-bg:            @state-success-bg;
        @alert-success-text:          @state-success-text;
        @alert-success-border:        @state-success-border;
        
        @alert-info-bg:               @state-info-bg;
        @alert-info-text:             @state-info-text;
        @alert-info-border:           @state-info-border;
        
        @alert-warning-bg:            @state-warning-bg;
        @alert-warning-text:          @state-warning-text;
        @alert-warning-border:        @state-warning-border;
        
        @alert-danger-bg:             @state-danger-bg;
        @alert-danger-text:           @state-danger-text;
        @alert-danger-border:         @state-danger-border;
        
        .alert-variant(@background; @border; @text-color) {
          background-color: @background;
          border-color: @border;
          color: @text-color;
        
          hr {
            border-top-color: darken(@border, 5%);
          }
          .alert-link {
            color: darken(@text-color, 10%);
          }
        }
        
        .alert-success {
          .alert-variant(@alert-success-bg; @alert-success-border; @alert-success-text);
        }
        
        .alert-info {
          .alert-variant(@alert-info-bg; @alert-info-border; @alert-info-text);
        }
        
        .alert-warning {
          .alert-variant(@alert-warning-bg; @alert-warning-border; @alert-warning-text);
        }
        
        .alert-danger {
          .alert-variant(@alert-danger-bg; @alert-danger-border; @alert-danger-text);
        }
    `
  let output = `
        $border-radius-base:        4px;
        
        //== Form states and alerts
        //
        //## Define colors for form feedback states and, by default, alerts.
        
        $state-success-text:             #3c763d;
        $state-success-bg:               #dff0d8;
        $state-success-border:           darken(adjust_hue($state-success-bg, -10), 5%);
        
        $state-info-text:                #31708f;
        $state-info-bg:                  #d9edf7;
        $state-info-border:              darken(adjust_hue($state-info-bg, -10), 7%);
        
        $state-warning-text:             #8a6d3b;
        $state-warning-bg:               #fcf8e3;
        $state-warning-border:           darken(adjust_hue($state-warning-bg, -10), 5%);
        
        $state-danger-text:              #a94442;
        $state-danger-bg:                #f2dede;
        $state-danger-border:            darken(adjust_hue($state-danger-bg, -10), 5%);
        
        //## Define alert colors, border radius, and padding.
        
        $alert-padding:               15px;
        $alert-border-radius:         $border-radius-base;
        $alert-link-font-weight:      bold;
        
        $alert-success-bg:            $state-success-bg;
        $alert-success-text:          $state-success-text;
        $alert-success-border:        $state-success-border;
        
        $alert-info-bg:               $state-info-bg;
        $alert-info-text:             $state-info-text;
        $alert-info-border:           $state-info-border;
        
        $alert-warning-bg:            $state-warning-bg;
        $alert-warning-text:          $state-warning-text;
        $alert-warning-border:        $state-warning-border;
        
        $alert-danger-bg:             $state-danger-bg;
        $alert-danger-text:           $state-danger-text;
        $alert-danger-border:         $state-danger-border;
        
        @mixin alert-variant($background, $border, $text-color) {
          background-color: $background;
          border-color: $border;
          color: $text-color;
        
          hr {
            border-top-color: darken($border, 5%);
          }
          .alert-link {
            color: darken($text-color, 10%);
          }
        }
        
        .alert-success {
          @include alert-variant($alert-success-bg, $alert-success-border, $alert-success-text);
        }
        
        .alert-info {
          @include alert-variant($alert-info-bg, $alert-info-border, $alert-info-text);
        }
        
        .alert-warning {
          @include alert-variant($alert-warning-bg, $alert-warning-border, $alert-warning-text);
        }
        
        .alert-danger {
          @include alert-variant($alert-danger-bg, $alert-danger-border, $alert-danger-text);
        }
    `
  return run(input, output, {})
})

it('mixin - definition - with default parameters', () => {
  let input = `
        @state-success-text:             #3c763d;
        @state-success-bg:               #dff0d8;
        @state-success-border:           darken(spin(@state-success-bg, -10), 5%);
        
        @state-info-text:                #31708f;
        @state-info-bg:                  #d9edf7;
        @state-info-border:              darken(spin(@state-info-bg, -10), 7%);
        
        @state-warning-text:             #8a6d3b;
        @state-warning-bg:               #fcf8e3;
        @state-warning-border:           darken(spin(@state-warning-bg, -10), 5%);
        
        @state-danger-text:              #a94442;
        @state-danger-bg:                #f2dede;
        @state-danger-border:            darken(spin(@state-danger-bg, -10), 5%);
        
        .box-shadow(@shadow) {
          -webkit-box-shadow: @shadow; // iOS <4.3 & Android <4.1
                  box-shadow: @shadow;
        }
        
        .form-control-validation(@text-color: #555; @border-color: #ccc; @background-color: #f5f5f5) {
          // Color the label and help text
          .help-block,
          .control-label,
          .radio,
          .checkbox,
          .radio-inline,
          .checkbox-inline,
          &.radio label,
          &.checkbox label,
          &.radio-inline label,
          &.checkbox-inline label  {
            color: @text-color;
          }
          // Set the border and box shadow on specific inputs to match
          .form-control {
            border-color: @border-color;
            .box-shadow(inset 0 1px 1px rgba(0,0,0,.075)); // Redeclare so transitions work
            &:focus {
              border-color: darken(@border-color, 10%);
              @shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 6px lighten(@border-color, 20%);
              .box-shadow(@shadow);
            }
          }
          // Set validation states also for addons
          .input-group-addon {
            color: @text-color;
            border-color: @border-color;
            background-color: @background-color;
          }
          // Optional feedback icon
          .form-control-feedback {
            color: @text-color;
          }
        }
        
        // Feedback states
        .has-success {
          .form-control-validation(@state-success-text; @state-success-text; @state-success-bg);
        }
        .has-warning {
          .form-control-validation(@state-warning-text; @state-warning-text; @state-warning-bg);
        }
        .has-error {
          .form-control-validation(@state-danger-text; @state-danger-text; @state-danger-bg);
        }
    `
  let output = `
        $state-success-text:             #3c763d;
        $state-success-bg:               #dff0d8;
        $state-success-border:           darken(adjust_hue($state-success-bg, -10), 5%);
        
        $state-info-text:                #31708f;
        $state-info-bg:                  #d9edf7;
        $state-info-border:              darken(adjust_hue($state-info-bg, -10), 7%);
        
        $state-warning-text:             #8a6d3b;
        $state-warning-bg:               #fcf8e3;
        $state-warning-border:           darken(adjust_hue($state-warning-bg, -10), 5%);
        
        $state-danger-text:              #a94442;
        $state-danger-bg:                #f2dede;
        $state-danger-border:            darken(adjust_hue($state-danger-bg, -10), 5%);
        
        @mixin box-shadow($shadow) {
          -webkit-box-shadow: $shadow; // iOS <4.3 & Android <4.1
                  box-shadow: $shadow;
        }
        
        @mixin form-control-validation($text-color: #555, $border-color: #ccc, $background-color: #f5f5f5) {
          // Color the label and help text
          .help-block,
          .control-label,
          .radio,
          .checkbox,
          .radio-inline,
          .checkbox-inline,
          &.radio label,
          &.checkbox label,
          &.radio-inline label,
          &.checkbox-inline label  {
            color: $text-color;
          }
          // Set the border and box shadow on specific inputs to match
          .form-control {
            border-color: $border-color;
            @include box-shadow(inset 0 1px 1px rgba(0,0,0,.075)); // Redeclare so transitions work
            &:focus {
              border-color: darken($border-color, 10%);
              $shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 6px lighten($border-color, 20%);
              @include box-shadow($shadow);
            }
          }
          // Set validation states also for addons
          .input-group-addon {
            color: $text-color;
            border-color: $border-color;
            background-color: $background-color;
          }
          // Optional feedback icon
          .form-control-feedback {
            color: $text-color;
          }
        }
        
        // Feedback states
        .has-success {
          @include form-control-validation($state-success-text, $state-success-text, $state-success-bg);
        }
        .has-warning {
          @include form-control-validation($state-warning-text, $state-warning-text, $state-warning-bg);
        }
        .has-error {
          @include form-control-validation($state-danger-text, $state-danger-text, $state-danger-bg);
        }
    `
  return run(input, output, {})
})

//
// Functions
//
it('Functions - string functions - e/~""(CSS escape with variable interpolation) - inside mixin usage', () => {
  let input = `
        @input-border-focus:             #66afe9;

        .box-shadow(@shadow) {
          -webkit-box-shadow: @shadow; // iOS <4.3 & Android <4.1
          box-shadow: @shadow;
        }

        .form-control-focus(@color: @input-border-focus) {
          @color-rgba: rgba(red(@color), green(@color), blue(@color), .6);
          &:focus {
            border-color: @color;
            outline: 0;
            .box-shadow(~"inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px @{color-rgba}");
          }
        }

        .form-control {
          .form-control-focus();
        }
    `
  let output = `
        $input-border-focus:             #66afe9;

        @mixin box-shadow($shadow) {
          -webkit-box-shadow: $shadow; // iOS <4.3 & Android <4.1
          box-shadow: $shadow;
        }

        @mixin form-control-focus($color: $input-border-focus) {
          $color-rgba: rgba(red($color), green($color), blue($color), .6);
          &:focus {
            border-color: $color;
            outline: 0;
            @include box-shadow(#{inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px $color-rgba});
          }
        }

        .form-control {
          @include form-control-focus();
        }
    `
  return run(input, output, {})
})

it('Functions - string functions - e/~""(CSS escape without variable interpolation) - inside mixin usage', () => {
  let input = `
        @input-border-focus:             #66afe9;

        .transition(@transition) {
          -webkit-transition: @transition;
               -o-transition: @transition;
                  transition: @transition;
        }

        .form-control {
          .transition(~"border-color ease-in-out .15s, box-shadow ease-in-out .15s");
        }
    `
  let output = `
        $input-border-focus:             #66afe9;

        @mixin transition($transition) {
          -webkit-transition: $transition;
               -o-transition: $transition;
                  transition: $transition;
        }

        .form-control {
          @include transition(#{border-color ease-in-out .15s, box-shadow ease-in-out .15s});
        }
    `
  return run(input, output, {})
})

it('Functions - string functions - e/~"" - inside declaration values', () => {
  let input = `
        .hide-text() {
          font: ~"0/0" a;
          color: transparent;
          text-shadow: none;
          background-color: transparent;
          border: 0;
        }
        
        // New mixin to use as of v3.0.1
        .text-hide() {
          .hide-text();
        }

        .text-hide {
          .text-hide();
        }
    `
  let output = `
        @mixin hide-text() {
          font: #{0/0} a;
          color: transparent;
          text-shadow: none;
          background-color: transparent;
          border: 0;
        }
        
        // New mixin to use as of v3.0.1
        @mixin text-hide() {
          @include hide-text();
        }

        .text-hide {
          @include text-hide();
        }
    `
  return run(input, output, {})
})

it('Functions - string functions - e/~"" - with variable interpolation', () => {
  let input = `
        @modal-backdrop-opacity:      .5;
        
        .opacity(@opacity) {
          opacity: @opacity;
          // IE8 filter
          @opacity-ie: (@opacity * 100);
          filter: ~"alpha(opacity=@{opacity-ie})";
        }
        
        .modal-backdrop {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          // Fade for backdrop
          &.fade { .opacity(0); }
          &.in { .opacity(@modal-backdrop-opacity); }
        }
    `
  let output = `
        $modal-backdrop-opacity:      .5;
        
        @mixin opacity($opacity) {
          opacity: $opacity;
          // IE8 filter
          $opacity-ie: ($opacity * 100);
          filter: #{alpha(opacity=$opacity-ie)};
        }
        
        .modal-backdrop {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          // Fade for backdrop
          &.fade { @include opacity(0); }
          &.in { @include opacity($modal-backdrop-opacity); }
        }
    `
  return run(input, output, {})
})

//
// @import At-Rules
//
it('@import At-Rules - File Extensions', () => {
  let input = `
        @import "foo";
        @import "foo.less";
        @import "foo.php";
        @import "foo.css";
    `
  let output = `
        @import "foo";
        @import "foo";
        @import "foo";
        @import "foo.css";
    `
  return run(input, output, {})
})

it('@import At-Rules - File Extensions - bs example', () => {
  let input = `
        // with folder
        @import "mixins/alerts.less";
        // comment
        @import "variables.less";
        @import "mixins.less";
        
        @import "normalize.less";
        @import "print.less";
        @import "glyphicons.less";
        
        @import "scaffolding.less";
        @import "type.less";
        @import "code.less";
        @import "grid.less";
        @import "tables.less";
        @import "forms.less";
        @import "buttons.less";
        
        @import "component-animations.less";
        @import "dropdowns.less";
        @import "button-groups.less";
        @import "input-groups.less";
        @import "navs.less";
        @import "navbar.less";
        @import "breadcrumbs.less";
        @import "pagination.less";
        @import "pager.less";
        @import "labels.less";
        @import "badges.less";
        @import "jumbotron.less";
        @import "thumbnails.less";
        @import "alerts.less";
        @import "progress-bars.less";
        @import "media.less";
        @import "list-group.less";
        @import "panels.less";
        @import "responsive-embed.less";
        @import "wells.less";
        @import "close.less";
        
        @import "modals.less";
        @import "tooltip.less";
        @import "popovers.less";
        @import "carousel.less";
        
        @import "utilities.less";
        @import "responsive-utilities.less";
    `
  let output = `
        // with folder
        @import "mixins/alerts";
        // comment
        @import "variables";
        @import "mixins";
        
        @import "normalize";
        @import "print";
        @import "glyphicons";
        
        @import "scaffolding";
        @import "type";
        @import "code";
        @import "grid";
        @import "tables";
        @import "forms";
        @import "buttons";
        
        @import "component-animations";
        @import "dropdowns";
        @import "button-groups";
        @import "input-groups";
        @import "navs";
        @import "navbar";
        @import "breadcrumbs";
        @import "pagination";
        @import "pager";
        @import "labels";
        @import "badges";
        @import "jumbotron";
        @import "thumbnails";
        @import "alerts";
        @import "progress-bars";
        @import "media";
        @import "list-group";
        @import "panels";
        @import "responsive-embed";
        @import "wells";
        @import "close";
        
        @import "modals";
        @import "tooltip";
        @import "popovers";
        @import "carousel";
        
        @import "utilities";
        @import "responsive-utilities";
    `
  return run(input, output, {})
})
