

javascript_data_obj_math
	: MATH DOT javascript_raw_math_funcname LPAR javascript_raw_math_parameter RPAR
		{
			if (typeof Math[$3] === "function" ) {
				$$ = Math[$3]($5);
			} else {
				throw 'Math.' + $3 + " not a function"
			}
		}
	;
javascript_raw_math_funcname
	: LITERAL
		{ $$ = $1 }
	| RANDOM
		{ $$ = 'random' }
	;
javascript_raw_math_parameter
	:
		{ $$ = undefined }
	| def_resolvable_expr
		{ $$ = $1 }
	;
