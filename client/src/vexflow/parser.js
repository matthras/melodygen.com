'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Parser = exports.X = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// A generic text parsing class for VexFlow.

var _vex = require('./vex');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// To enable logging for this class. Set `Vex.Flow.Parser.DEBUG` to `true`.
function L() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  if (Parser.DEBUG) _vex.Vex.L('Vex.Flow.Parser', args);
}

var X = exports.X = _vex.Vex.MakeException('ParserError');

// Converts parser results into an easy to reference list that can be
// used in triggers.
function flattenMatches(results) {
  if (results.matchedString !== undefined) return results.matchedString;
  if (results.results) return flattenMatches(results.results);
  if (results.length === 1) return flattenMatches(results[0]);
  if (results.length === 0) return null;
  return results.map(flattenMatches);
}

// This is the base parser class. Given an arbitrary context-free grammar, it
// can parse any line and execute code when specific rules are met (e.g.,
// when a string is terminated.)

var Parser = exports.Parser = function () {
  // For an example of a simple grammar, take a look at tests/parser_tests.js or
  // the EasyScore grammar in easyscore.js.
  function Parser(grammar) {
    _classCallCheck(this, Parser);

    this.grammar = grammar;
  }

  // Parse `line` using current grammar. Returns {success: true} if the
  // line parsed correctly, otherwise returns `{success: false, errorPos: N}`
  // where `errorPos` is the location of the error in the string.


  _createClass(Parser, [{
    key: 'parse',
    value: function parse(line) {
      this.line = line;
      this.pos = 0;
      this.errorPos = -1;
      var results = this.expect(this.grammar.begin());
      results.errorPos = this.errorPos;
      return results;
    }
  }, {
    key: 'matchFail',
    value: function matchFail(returnPos) {
      if (this.errorPos === -1) this.errorPos = this.pos;
      this.pos = returnPos;
    }
  }, {
    key: 'matchSuccess',
    value: function matchSuccess() {
      this.errorPos = -1;
    }

    // Look for `token` in this.line[this.pos], and return success
    // if one is found. `token` is specified as a regular expression.

  }, {
    key: 'matchToken',
    value: function matchToken(token) {
      var noSpace = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      var regexp = noSpace ? new RegExp('^((' + token + '))') : new RegExp('^((' + token + ')\\s*)');
      var workingLine = this.line.slice(this.pos);
      var result = workingLine.match(regexp);
      if (result !== null) {
        return {
          success: true,
          matchedString: result[2],
          incrementPos: result[1].length,
          pos: this.pos
        };
      } else {
        return {
          success: false,
          pos: this.pos
        };
      }
    }

    // Execute rule to match a sequence of tokens (or rules). If `maybe` is
    // set, then return success even if the token is not found, but reset
    // the position before exiting.

  }, {
    key: 'expectOne',
    value: function expectOne(rule) {
      var maybe = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      var results = [];
      var pos = this.pos;

      var allMatches = true;
      var oneMatch = false;
      maybe = maybe === true || rule.maybe === true;

      // Execute all sub rules in sequence.
      for (var i = 0; i < rule.expect.length; i++) {
        var next = rule.expect[i];
        var localPos = this.pos;
        var result = this.expect(next);

        // If `rule.or` is set, then return success if any one
        // of the subrules match, else all subrules must match.
        if (result.success) {
          results.push(result);
          oneMatch = true;
          if (rule.or) break;
        } else {
          allMatches = false;
          if (!rule.or) {
            this.pos = localPos;
            break;
          }
        }
      }

      var gotOne = rule.or && oneMatch || allMatches;
      var success = gotOne || maybe === true;
      if (maybe && !gotOne) this.pos = pos;
      if (success) this.matchSuccess();else this.matchFail(pos);
      return { success: success, results: results, numMatches: gotOne ? 1 : 0 };
    }

    // Try to match multiple (one or more) instances of the rule. If `maybe` is set,
    // then a failed match is also a success (but the position is reset).

  }, {
    key: 'expectOneOrMore',
    value: function expectOneOrMore(rule) {
      var maybe = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      var results = [];
      var pos = this.pos;
      var numMatches = 0;
      var more = true;

      do {
        var result = this.expectOne(rule);
        if (result.success) {
          numMatches++;
          results.push(result.results);
        } else {
          more = false;
        }
      } while (more);

      var success = numMatches > 0 || maybe === true;
      if (maybe && !(numMatches > 0)) this.pos = pos;
      if (success) this.matchSuccess();else this.matchFail(pos);
      return { success: success, results: results, numMatches: numMatches };
    }

    // Match zero or more instances of `rule`. Offloads to `expectOneOrMore`.

  }, {
    key: 'expectZeroOrMore',
    value: function expectZeroOrMore(rule) {
      return this.expectOneOrMore(rule, true);
    }

    // Execute the rule produced by the provided the `rules` function. This
    // ofloads to one of the above matchers and consolidates the results. It is also
    // responsible for executing any code triggered by the rule (in `rule.run`.)

  }, {
    key: 'expect',
    value: function expect(rules) {
      L('Evaluating rules:', rules);
      var result = void 0;
      if (!rules) {
        throw new X('Invalid Rule: ' + rules, rules);
      }

      // Get rule from Grammar class.
      var rule = rules.bind(this.grammar)();

      if (rule.token) {
        // Base case: parse the regex and throw an error if the
        // line doesn't match.
        result = this.matchToken(rule.token, rule.noSpace === true);
        if (result.success) {
          // Token match! Update position and throw away parsed portion
          // of string.
          this.pos += result.incrementPos;
        }
      } else if (rule.expect) {
        if (rule.oneOrMore) {
          result = this.expectOneOrMore(rule);
        } else if (rule.zeroOrMore) {
          result = this.expectZeroOrMore(rule);
        } else {
          result = this.expectOne(rule);
        }
      } else {
        throw new X('Bad grammar! No `token` or `expect` property', rule);
      }

      // If there's a trigger attached to this rule, then pull it.
      result.matches = [];
      if (result.results) result.results.forEach(function (r) {
        return result.matches.push(flattenMatches(r));
      });
      if (rule.run && result.success) rule.run(result);
      return result;
    }
  }]);

  return Parser;
}();