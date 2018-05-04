var parserV2 = (function(){
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[1,6],$V1=[5,6],$V2=[5,6,22],$V3=[10,11,32,33],$V4=[1,22],$V5=[1,23],$V6=[1,19],$V7=[1,21],$V8=[1,25],$V9=[5,6,22,24,40,43],$Va=[5,6,22,24,30,38,40,43],$Vb=[5,6,13,22,24,40,43,47,48,49,50,51,52,53,54,56],$Vc=[5,6,22,24,47,48,49,50,51,52,53,54,56],$Vd=[5,6,22,24,43],$Ve=[5,6,22,24],$Vf=[1,49],$Vg=[1,50],$Vh=[1,45],$Vi=[1,54],$Vj=[1,56],$Vk=[1,57],$Vl=[1,58],$Vm=[1,59],$Vn=[1,60],$Vo=[1,61],$Vp=[1,62];
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"main":3,"sql_stmt_list":4,"EOF":5,"SEMICOLON":6,"sql_stmt":7,"select_stmt":8,"name":9,"LITERAL":10,"BRALITERAL":11,"database_table_name":12,"DOT":13,"database_index_name":14,"signed_number":15,"NUMBER":16,"string_literal":17,"STRING":18,"XSTRING":19,"literal_value":20,"limit_clause":21,"LIMIT":22,"sort_clause":23,"DESC":24,"select":25,"distinct_all":26,"DISTINCT":27,"ALL":28,"result_columns":29,"COMMA":30,"result_column":31,"STAR":32,"expr":33,"alias":34,"join_clause":35,"table_or_subquery":36,"from":37,"FROM":38,"use_index":39,"USE":40,"INDEX":41,"where":42,"WHERE":43,"where_expr":44,"SELECT":45,"bind_parameter":46,"AND":47,"OR":48,"EQ":49,"GT":50,"GE":51,"LT":52,"LE":53,"BETWEEN":54,"where_between":55,"LIKE":56,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",6:"SEMICOLON",10:"LITERAL",11:"BRALITERAL",13:"DOT",16:"NUMBER",18:"STRING",19:"XSTRING",22:"LIMIT",24:"DESC",27:"DISTINCT",28:"ALL",30:"COMMA",32:"STAR",33:"expr",34:"alias",38:"FROM",40:"USE",41:"INDEX",43:"WHERE",45:"SELECT",46:"bind_parameter",47:"AND",48:"OR",49:"EQ",50:"GT",51:"GE",52:"LT",53:"LE",54:"BETWEEN",56:"LIKE"},
productions_: [0,[3,2],[4,3],[4,1],[7,1],[9,1],[9,1],[12,3],[12,1],[14,1],[15,1],[17,1],[17,1],[20,1],[20,1],[21,0],[21,2],[23,0],[23,1],[8,3],[26,0],[26,1],[26,1],[29,3],[29,1],[31,1],[31,3],[31,2],[35,1],[36,1],[37,0],[37,2],[39,0],[39,3],[42,2],[42,0],[25,6],[44,1],[44,1],[44,1],[44,3],[44,3],[44,3],[44,3],[44,3],[44,3],[44,3],[44,3],[44,3],[55,3],[55,3]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:

			this.$ = $$[$0-1];
			return this.$;

break;
case 2:
 this.$ = $$[$0-2]; if($$[$0]) this.$.push($$[$0]);
break;
case 3: case 24: case 28:
 this.$ = [$$[$0]];
break;
case 5: case 10: case 11: case 12: case 29: case 33: case 37:
 this.$ = $$[$0];
break;
case 6:
 this.$ = $$[$0].substr(1,$$[$0].length-2);
break;
case 7:
 this.$ = {database:$$[$0-2], table:$$[$0]};
break;
case 8:
 this.$ = {table:$$[$0]};
break;
case 9:
 this.$ = {index:$$[$0]};
break;
case 13:
 this.$ = {type:'number', number:$$[$0]};
break;
case 14:
 this.$ = {type:'string', string: $$[$0]}
break;
case 15: case 17: case 20: case 30: case 32:
 this.$ = undefined;
break;
case 16:
 this.$ = {limit: $$[$0]};
break;
case 18:
 this.$ = { sort: 'DESC' };
break;
case 19:

			this.$ = {statement: 'SELECT', selects: $$[$0-2]};
			yy.extend(this.$,$$[$0-1]);
			yy.extend(this.$,$$[$0]);

break;
case 21:
 this.$ = {distinct:true};
break;
case 22:
 this.$ = {all:true};
break;
case 23:
 this.$ = $$[$0-2]; this.$.push($$[$0]);
break;
case 25:
 this.$ = {star:true};
break;
case 26:
 this.$ = {table: $$[$0-2], star:true};
break;
case 27:
 this.$ = {expr: $$[$0-1]}; yy.extend(this.$,$$[$0]);
break;
case 31:
 this.$ = {from:$$[$0]};
break;
case 34:
 this.$ = {where: $$[$0]};
break;
case 36:

			this.$ = {columns:$$[$0-3]};
			yy.extend(this.$,$$[$0-4]);
			yy.extend(this.$,$$[$0-2]);
			yy.extend(this.$,$$[$0-1]);
			yy.extend(this.$,$$[$0]);

break;
case 38:
 this.$ = {bind_parameter: $$[$0]};
break;
case 39:
 this.$ = {column: $$[$0]};
break;
case 40:
 this.$ = {op: 'AND', left: $$[$0-2], right: $$[$0]};
break;
case 41:
 this.$ = {op: 'OR', left: $$[$0-2], right: $$[$0]};
break;
case 42:
 this.$ = {op: '=', left: $$[$0-2], right: $$[$0]};
break;
case 43:
 this.$ = {op: '>', left: $$[$0-2], right: $$[$0]};
break;
case 44:
 this.$ = {op: '>=', left: $$[$0-2], right: $$[$0]};
break;
case 45:
 this.$ = {op: '<', left: $$[$0-2], right: $$[$0]};
break;
case 46:
 this.$ = {op: '<=', left: $$[$0-2], right: $$[$0]};
break;
case 47:

			this.$ = {op: 'BETWEEN', left: $$[$0-2], right:$$[$0] };

break;
case 48:

			this.$ = {op: 'LIKE', left:$$[$0-2], right: { type: 'string', string: $$[$0] } };

break;
case 49:
 this.$ = {left: { type: 'number', number: $$[$0-2]}, right: {type: 'number', number: $$[$0] } };
break;
case 50:
 this.$ = {left: { type: 'string', string: $$[$0-2]}, right: {type: 'string', string: $$[$0] } };
break;
}
},
table: [{3:1,4:2,7:3,8:4,25:5,45:$V0},{1:[3]},{5:[1,7],6:[1,8]},o($V1,[2,3]),o($V1,[2,4]),o($V2,[2,17],{23:9,24:[1,10]}),o($V3,[2,20],{26:11,27:[1,12],28:[1,13]}),{1:[2,1]},{7:14,8:4,25:5,45:$V0},o($V1,[2,15],{21:15,22:[1,16]}),o($V2,[2,18]),{9:20,10:$V4,11:$V5,29:17,31:18,32:$V6,33:$V7},o($V3,[2,21]),o($V3,[2,22]),o($V1,[2,2]),o($V1,[2,19]),{15:24,16:$V8},o($V9,[2,30],{37:26,30:[1,27],38:[1,28]}),o($Va,[2,24]),o($Va,[2,25]),{13:[1,29]},{34:[1,30]},o($Vb,[2,5]),o($Vb,[2,6]),o($V1,[2,16]),o($Vc,[2,10]),o($Vd,[2,32],{39:31,40:[1,32]}),{9:20,10:$V4,11:$V5,31:33,32:$V6,33:$V7},{9:37,10:$V4,11:$V5,12:36,35:34,36:35},{32:[1,38]},o($Va,[2,27]),o($Ve,[2,35],{42:39,43:[1,40]}),{41:[1,41]},o($Va,[2,23]),o($V9,[2,31]),o($V9,[2,28]),o($V9,[2,29]),o($V9,[2,8],{13:[1,42]}),o($Va,[2,26]),o($Ve,[2,36]),{9:46,10:$V4,11:$V5,15:47,16:$V8,17:48,18:$Vf,19:$Vg,20:44,44:43,46:$Vh},{9:52,10:$V4,11:$V5,14:51},{9:53,10:$V4,11:$V5},o($Ve,[2,34],{47:$Vi,48:[1,55],49:$Vj,50:$Vk,51:$Vl,52:$Vm,53:$Vn,54:$Vo,56:$Vp}),o($Vc,[2,37]),o($Vc,[2,38]),o($Vc,[2,39]),o($Vc,[2,13]),o($Vc,[2,14]),o($Vc,[2,11]),o($Vc,[2,12]),o($Vd,[2,33]),o($Vd,[2,9]),o($V9,[2,7]),{9:46,10:$V4,11:$V5,15:47,16:$V8,17:48,18:$Vf,19:$Vg,20:44,44:63,46:$Vh},{9:46,10:$V4,11:$V5,15:47,16:$V8,17:48,18:$Vf,19:$Vg,20:44,44:64,46:$Vh},{9:46,10:$V4,11:$V5,15:47,16:$V8,17:48,18:$Vf,19:$Vg,20:44,44:65,46:$Vh},{9:46,10:$V4,11:$V5,15:47,16:$V8,17:48,18:$Vf,19:$Vg,20:44,44:66,46:$Vh},{9:46,10:$V4,11:$V5,15:47,16:$V8,17:48,18:$Vf,19:$Vg,20:44,44:67,46:$Vh},{9:46,10:$V4,11:$V5,15:47,16:$V8,17:48,18:$Vf,19:$Vg,20:44,44:68,46:$Vh},{9:46,10:$V4,11:$V5,15:47,16:$V8,17:48,18:$Vf,19:$Vg,20:44,44:69,46:$Vh},{15:71,16:$V8,17:72,18:$Vf,19:$Vg,55:70},{17:73,18:$Vf,19:$Vg},o([5,6,22,24,47,48],[2,40],{49:$Vj,50:$Vk,51:$Vl,52:$Vm,53:$Vn,54:$Vo,56:$Vp}),o([5,6,22,24,48],[2,41],{47:$Vi,49:$Vj,50:$Vk,51:$Vl,52:$Vm,53:$Vn,54:$Vo,56:$Vp}),o([5,6,22,24,47,48,49,54,56],[2,42],{50:$Vk,51:$Vl,52:$Vm,53:$Vn}),o($Vc,[2,43]),o($Vc,[2,44]),o($Vc,[2,45]),o($Vc,[2,46]),o($Vc,[2,47]),{47:[1,74]},{47:[1,75]},o($Vc,[2,48]),{15:76,16:$V8},{17:77,18:$Vf,19:$Vg},o($Vc,[2,49]),o($Vc,[2,50])],
defaultActions: {7:[2,1]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        var error = new Error(str);
        error.hash = hash;
        throw error;
    }
},
parse: function parse(input) {
    var self = this, stack = [0], tstack = [], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    var args = lstack.slice.call(arguments, 1);
    var lexer = Object.create(this.lexer);
    var sharedState = { yy: {} };
    for (var k in this.yy) {
        if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
            sharedState.yy[k] = this.yy[k];
        }
    }
    lexer.setInput(input, sharedState.yy);
    sharedState.yy.lexer = lexer;
    sharedState.yy.parser = this;
    if (typeof lexer.yylloc == 'undefined') {
        lexer.yylloc = {};
    }
    var yyloc = lexer.yylloc;
    lstack.push(yyloc);
    var ranges = lexer.options && lexer.options.ranges;
    if (typeof sharedState.yy.parseError === 'function') {
        this.parseError = sharedState.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    _token_stack:
        var lex = function () {
            var token;
            token = lexer.lex() || EOF;
            if (typeof token !== 'number') {
                token = self.symbols_[token] || token;
            }
            return token;
        };
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(lexer.yytext);
            lstack.push(lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = lexer.yyleng;
                yytext = lexer.yytext;
                yylineno = lexer.yylineno;
                yyloc = lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                sharedState.yy,
                action[1],
                vstack,
                lstack
            ].concat(args));
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};
/* generated by jison-lex 0.3.4 */
var lexer = (function(){
var lexer = ({

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input, yy) {
        this.yy = yy || this.yy || {};
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex() {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState(condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {"case-insensitive":true},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {
var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:return 11
break;
case 1:return 11
break;
case 2:return 19
break;
case 3:return 18
break;
case 4:return 18
break;
case 5:/* skip -- comments */
break;
case 6:/* skip whitespace */
break;
case 7:return 'ABORT'
break;
case 8:return 'ADD'
break;
case 9:return 'AFTER'
break;
case 10:return 28
break;
case 11:return 'ALTER'
break;
case 12:return 'ANALYZE'
break;
case 13:return 47
break;
case 14:return 'AS'
break;
case 15:return 'ASC'
break;
case 16:return 'ATTACH'
break;
case 17:return 'BEFORE'
break;
case 18:return 'BEGIN'
break;
case 19:return 54
break;
case 20:return 'BY'
break;
case 21:return 'CASCADE'
break;
case 22:return 'CASE'
break;
case 23:return 'CAST'
break;
case 24:return 'CHECK'
break;
case 25:return 'COLLATE'
break;
case 26:return 'COLUMN'
break;
case 27:return 'CONFLICT'
break;
case 28:return 'CONSTRAINT'
break;
case 29:return 'CREATE'
break;
case 30:return 'CROSS'
break;
case 31:return 'CURRENT DATE'
break;
case 32:return 'CURRENT TIME'
break;
case 33:return 'CURRENT TIMESTAMP'
break;
case 34:return 'DATABASE'
break;
case 35:return 'DEFAULT'
break;
case 36:return 'DEFERRABLE'
break;
case 37:return 'DEFERRED'
break;
case 38:return 'DELETE'
break;
case 39:return 24
break;
case 40:return 'DETACH'
break;
case 41:return 27
break;
case 42:return 'DROP'
break;
case 43:return 'EACH'
break;
case 44:return 'ELSE'
break;
case 45:return 'END'
break;
case 46:return 'ESCAPE'
break;
case 47:return 'EXCEPT'
break;
case 48:return 'EXCLUSIVE'
break;
case 49:return 'EXISTS'
break;
case 50:return 'EXPLAIN'
break;
case 51:return 'FAIL'
break;
case 52:return 'FOR'
break;
case 53:return 'FOREIGN'
break;
case 54:return 38
break;
case 55:return 'FULL'
break;
case 56:return 'GLOB'
break;
case 57:return 'GROUP'
break;
case 58:return 'HAVING'
break;
case 59:return 'IF'
break;
case 60:return 'IGNORE'
break;
case 61:return 'IMMEDIATE'
break;
case 62:return 'IN'
break;
case 63:return 40
break;
case 64:return 41
break;
case 65:return 'INDEXED'
break;
case 66:return 'INITIALLY'
break;
case 67:return 'INNER'
break;
case 68:return 'INSERT'
break;
case 69:return 'INSTEAD'
break;
case 70:return 'INTERSECT'
break;
case 71:return 'INTO'
break;
case 72:return 'IS'
break;
case 73:return 'ISNULL'
break;
case 74:return 'JOIN'
break;
case 75:return 'KEY'
break;
case 76:return 'LEFT'
break;
case 77:return 56
break;
case 78:return 22
break;
case 79:return 'MATCH'
break;
case 80:return 'NATURAL'
break;
case 81:return 'NO'
break;
case 82:return 'NOT'
break;
case 83:return 'NOTNULL'
break;
case 84:return 'NULL'
break;
case 85:return 'OF'
break;
case 86:return 'OFFSET'
break;
case 87:return 'ON'
break;
case 88:return 48
break;
case 89:return 'ORDER'
break;
case 90:return 'OUTER'
break;
case 91:return 'PLAN'
break;
case 92:return 'PRAGMA'
break;
case 93:return 'PRIMARY'
break;
case 94:return 'QUERY'
break;
case 95:return 'RAISE'
break;
case 96:return 'RECURSIVE'
break;
case 97:return 'REFERENCES'
break;
case 98:return 'REGEXP'
break;
case 99:return 'REINDEX'
break;
case 100:return 'RELEASE'
break;
case 101:return 'RENAME'
break;
case 102:return 'REPLACE'
break;
case 103:return 'RESTRICT'
break;
case 104:return 'RIGHT'
break;
case 105:return 'ROLLBACK'
break;
case 106:return 'ROW'
break;
case 107:return 45
break;
case 108:return 'SET'
break;
case 109:return 'TABLE'
break;
case 110:return 'TEMP'
break;
case 111:return 'THEN'
break;
case 112:return 'TO'
break;
case 113:return 'TRIGGER'
break;
case 114:return 'UNION'
break;
case 115:return 'UNIQUE'
break;
case 116:return 'UPDATE'
break;
case 117:return 'USING'
break;
case 118:return 'VACUUM'
break;
case 119:return 'VALUES'
break;
case 120:return 'VIEW'
break;
case 121:return 'WHEN'
break;
case 122:return 43
break;
case 123:return 'WITH'
break;
case 124:return 16
break;
case 125:return 16
break;
case 126:return 'TILDEs'
break;
case 127:return 'PLUS'
break;
case 128:return 'MINUS'
break;
case 129:return 32
break;
case 130:return 'SLASH'
break;
case 131:return 'REM'
break;
case 132:return 'RSHIFT'
break;
case 133:return 'LSHIFT'
break;
case 134:return 'NE'
break;
case 135:return 'NE'
break;
case 136:return 51
break;
case 137:return 50
break;
case 138:return 53
break;
case 139:return 52
break;
case 140:return 49
break;
case 141:return 'BITAND'
break;
case 142:return 'BITOR'
break;
case 143:return 'LPAR'
break;
case 144:return 'RPAR'
break;
case 145:return 13
break;
case 146:return 30
break;
case 147:return 'COLON'
break;
case 148:return 6
break;
case 149:return 'DOLLAR'
break;
case 150:return 'QUESTION'
break;
case 151:return 'CARET'
break;
case 152:return 10
break;
case 153:return 5
break;
case 154:return 'INVALID'
break;
}
},
rules: [/^(?:\[([^\]])*?\])/i,/^(?:([`](\\.|[^"]|\\")*?[`])+)/i,/^(?:X(['](\\.|[^']|\\')*?['])+)/i,/^(?:(['](\\.|[^']|\\')*?['])+)/i,/^(?:(["](\\.|[^"]|\\")*?["])+)/i,/^(?:--(.*?)($|\r\n|\r|\n))/i,/^(?:\s+)/i,/^(?:ABORT\b)/i,/^(?:ADD\b)/i,/^(?:AFTER\b)/i,/^(?:ALL\b)/i,/^(?:ALTER\b)/i,/^(?:ANALYZE\b)/i,/^(?:AND\b)/i,/^(?:AS\b)/i,/^(?:ASC\b)/i,/^(?:ATTACH\b)/i,/^(?:BEFORE\b)/i,/^(?:BEGIN\b)/i,/^(?:BETWEEN\b)/i,/^(?:BY\b)/i,/^(?:CASCADE\b)/i,/^(?:CASE\b)/i,/^(?:CAST\b)/i,/^(?:CHECK\b)/i,/^(?:COLLATE\b)/i,/^(?:COLUMN\b)/i,/^(?:CONFLICT\b)/i,/^(?:CONSTRAINT\b)/i,/^(?:CREATE\b)/i,/^(?:CROSS\b)/i,/^(?:CURRENT_DATE\b)/i,/^(?:CURRENT_TIME\b)/i,/^(?:CURRENT_TIMESTAMP\b)/i,/^(?:DATABASE\b)/i,/^(?:DEFAULT\b)/i,/^(?:DEFERRABLE\b)/i,/^(?:DEFERRED\b)/i,/^(?:DELETE\b)/i,/^(?:DESC\b)/i,/^(?:DETACH\b)/i,/^(?:DISTINCT\b)/i,/^(?:DROP\b)/i,/^(?:EACH\b)/i,/^(?:ELSE\b)/i,/^(?:END\b)/i,/^(?:ESCAPE\b)/i,/^(?:EXCEPT\b)/i,/^(?:EXCLUSIVE\b)/i,/^(?:EXISTS\b)/i,/^(?:EXPLAIN\b)/i,/^(?:FAIL\b)/i,/^(?:FOR\b)/i,/^(?:FOREIGN\b)/i,/^(?:FROM\b)/i,/^(?:FULL\b)/i,/^(?:GLOB\b)/i,/^(?:GROUP\b)/i,/^(?:HAVING\b)/i,/^(?:IF\b)/i,/^(?:IGNORE\b)/i,/^(?:IMMEDIATE\b)/i,/^(?:IN\b)/i,/^(?:USE\b)/i,/^(?:INDEX\b)/i,/^(?:INDEXED\b)/i,/^(?:INITIALLY\b)/i,/^(?:INNER\b)/i,/^(?:INSERT\b)/i,/^(?:INSTEAD\b)/i,/^(?:INTERSECT\b)/i,/^(?:INTO\b)/i,/^(?:IS\b)/i,/^(?:ISNULL\b)/i,/^(?:JOIN\b)/i,/^(?:KEY\b)/i,/^(?:LEFT\b)/i,/^(?:LIKE\b)/i,/^(?:LIMIT\b)/i,/^(?:MATCH\b)/i,/^(?:NATURAL\b)/i,/^(?:NO\b)/i,/^(?:NOT\b)/i,/^(?:NOTNULL\b)/i,/^(?:NULL\b)/i,/^(?:OF\b)/i,/^(?:OFFSET\b)/i,/^(?:ON\b)/i,/^(?:OR\b)/i,/^(?:ORDER\b)/i,/^(?:OUTER\b)/i,/^(?:PLAN\b)/i,/^(?:PRAGMA\b)/i,/^(?:PRIMARY\b)/i,/^(?:QUERY\b)/i,/^(?:RAISE\b)/i,/^(?:RECURSIVE\b)/i,/^(?:REFERENCES\b)/i,/^(?:REGEXP\b)/i,/^(?:REINDEX\b)/i,/^(?:RELEASE\b)/i,/^(?:RENAME\b)/i,/^(?:REPLACE\b)/i,/^(?:RESTRICT\b)/i,/^(?:RIGHT\b)/i,/^(?:ROLLBACK\b)/i,/^(?:ROW\b)/i,/^(?:SELECT\b)/i,/^(?:SET\b)/i,/^(?:TABLE\b)/i,/^(?:TEMP\b)/i,/^(?:THEN\b)/i,/^(?:TO\b)/i,/^(?:TRIGGER\b)/i,/^(?:UNION\b)/i,/^(?:UNIQUE\b)/i,/^(?:UPDATE\b)/i,/^(?:USING\b)/i,/^(?:VACUUM\b)/i,/^(?:VALUES\b)/i,/^(?:VIEW\b)/i,/^(?:WHEN\b)/i,/^(?:WHERE\b)/i,/^(?:WITH\b)/i,/^(?:[-]?(\d*[.])?\d+[eE]\d+)/i,/^(?:[-]?(\d*[.])?\d+)/i,/^(?:~)/i,/^(?:\+)/i,/^(?:-)/i,/^(?:\*)/i,/^(?:\/)/i,/^(?:%)/i,/^(?:>>)/i,/^(?:<<)/i,/^(?:<>)/i,/^(?:!=)/i,/^(?:>=)/i,/^(?:>)/i,/^(?:<=)/i,/^(?:<)/i,/^(?:=)/i,/^(?:&)/i,/^(?:\|)/i,/^(?:\()/i,/^(?:\))/i,/^(?:\.)/i,/^(?:,)/i,/^(?::)/i,/^(?:;)/i,/^(?:\$)/i,/^(?:\?)/i,/^(?:\^)/i,/^(?:[a-zA-Z_][a-zA-Z_0-9]*)/i,/^(?:$)/i,/^(?:.)/i],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154],"inclusive":true}}
});
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = parserV2;
exports.Parser = parserV2.Parser;
exports.parse = function () { return parserV2.parse.apply(parserV2, arguments); };
exports.main = function commonjsMain(args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = require('fs').readFileSync(require('path').normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(process.argv.slice(1));
}
}
