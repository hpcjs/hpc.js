import { VariableType } from '../types';

const functions = {
  math: {
    abs: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'abs($1)',
      },
    ],
    acos: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'acos($1)',
      },
    ],
    acosh: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'acosh($1)',
      },
    ],
    asin: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'asin($1)',
      },
    ],
    asinh: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'asinh($1)',
      },
    ],
    atan: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'atan($1)',
      },
    ],
    atanh: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'atanh($1)',
      },
    ],
    atan2: [
      {
        returnType: 'number',
        arguments: ['number', 'number'],
        formula: 'atan2($1, $2)',
      },
    ],
    ceil: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'ceil($1)',
      },
    ],
    cos: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'cos($1)',
      },
    ],
    cosh: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'cosh($1)',
      },
    ],
    exp: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'exp($1)',
      },
    ],
    floor: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'floor($1)',
      },
    ],
    log: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'log($1)',
      },
    ],
    log2: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'log2($1)',
      },
    ],
    max: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'max($1)',
      },
    ],
    min: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'min($1)',
      },
    ],
    pow: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'pow($1)',
      },
    ],
    round: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'round($1)',
      },
    ],
    sign: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'sign($1)',
      },
    ],
    sin: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'sin($1)',
      },
    ],
    sinh: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'sinh($1)',
      },
    ],
    sqrt: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'sqrt($1)',
      },
    ],
    tan: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'tan($1)',
      },
    ],
    tanh: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'tanh($1)',
      },
    ],
    trunc: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'trunc($1)',
      },
    ],
  },
  standalone: {
    dim: [
      {
        returnType: 'number',
        arguments: ['numberarray'],
        formula: 'f32($s)',
      },
      {
        returnType: 'number',
        arguments: ['vec2array'],
        formula: 'f32($s)',
      },
      {
        returnType: 'number',
        arguments: ['vec3array'],
        formula: 'f32($s)',
      },
      {
        returnType: 'number',
        arguments: ['vec4array'],
        formula: 'f32($s)',
      },
      {
        returnType: 'number',
        arguments: ['booleanarray'],
        formula: 'f32($s)',
      },
      {
        returnType: 'number',
        arguments: ['buffer1d'],
        formula: 'f32($s)',
      },
      {
        returnType: 'vec2',
        arguments: ['buffer2d'],
        formula: 'vec2<f32>($s)',
      },
      {
        returnType: 'vec3',
        arguments: ['buffer3d'],
        formula: 'vec3<f32>($s)',
      },
    ],
    array: [
      {
        returnType: 'numberarray',
        arguments: ['number', 'number'],
        formula: 'array<f32, $0>($r)',
      },
      {
        returnType: 'numberarray',
        arguments: ['numberarrayliteral'],
        formula: 'array<f32, $s>($0)',
      },
      {
        returnType: 'vec2array',
        arguments: ['number', 'vec2'],
        formula: 'array<vec2<f32>, $0>($r)',
      },
      {
        returnType: 'vec2array',
        arguments: ['vec2arrayliteral'],
        formula: 'array<vec2<f32>, $s>($0)',
      },
      {
        returnType: 'vec3array',
        arguments: ['number', 'vec3'],
        formula: 'array<vec3<f32>, $0>($r)',
      },
      {
        returnType: 'vec3array',
        arguments: ['vec3arrayliteral'],
        formula: 'array<vec3<f32>, $s>($0)',
      },
      {
        returnType: 'vec4array',
        arguments: ['number', 'vec4'],
        formula: 'array<vec4<f32>, $0>($r)',
      },
      {
        returnType: 'vec4array',
        arguments: ['vec4arrayliteral'],
        formula: 'array<vec4<f32>, $s>($0)',
      },
      {
        returnType: 'booleanarray',
        arguments: ['number', 'boolean'],
        formula: 'array<bool, $0>($r)',
      },
      {
        returnType: 'booleanarray',
        arguments: ['booleanarrayliteral'],
        formula: 'array<bool, $s>($0)',
      },
    ],
    vec2: [
      {
        returnType: 'vec2',
        arguments: ['number', 'number'],
        formula: 'vec2<f32>($0, $1)',
      },
      {
        returnType: 'vec2',
        arguments: ['number'],
        formula: 'vec2<f32>($0)',
      },
    ],
    vec3: [
      {
        returnType: 'vec3',
        arguments: ['number', 'number', 'number'],
        formula: 'vec3<f32>($0, $1, $2)',
      },
      {
        returnType: 'vec3',
        arguments: ['number'],
        formula: 'vec3<f32>($0)',
      },
    ],
    vec4: [
      {
        returnType: 'vec4',
        arguments: ['number', 'number', 'number', 'number'],
        formula: 'vec4<f32>($0, $1, $2, $3)',
      },
      {
        returnType: 'vec4',
        arguments: ['number'],
        formula: 'vec4<f32>($0)',
      },
    ],
    '==': [
      {
        returnType: 'boolean',
        arguments: ['number', 'number'],
        formula: '($0 == $1)',
      },
      {
        returnType: 'boolean',
        arguments: ['vec2', 'vec2'],
        formula: '($0 == $1)',
      },
      {
        returnType: 'boolean',
        arguments: ['vec3', 'vec3'],
        formula: '($0 == $1)',
      },
      {
        returnType: 'boolean',
        arguments: ['vec4', 'vec4'],
        formula: '($0 == $1)',
      },
    ],
    '!=': [
      {
        returnType: 'boolean',
        arguments: ['number', 'number'],
        formula: '($0 != $1)',
      },
      {
        returnType: 'boolean',
        arguments: ['vec2', 'vec2'],
        formula: '($0 != $1)',
      },
      {
        returnType: 'boolean',
        arguments: ['vec3', 'vec3'],
        formula: '($0 != $1)',
      },
      {
        returnType: 'boolean',
        arguments: ['vec4', 'vec4'],
        formula: '($0 != $1)',
      },
    ],
    '===': [
      {
        returnType: 'boolean',
        arguments: ['number', 'number'],
        formula: '($0 == $1)',
      },
      {
        returnType: 'boolean',
        arguments: ['vec2', 'vec2'],
        formula: '($0 == $1)',
      },
      {
        returnType: 'boolean',
        arguments: ['vec3', 'vec3'],
        formula: '($0 == $1)',
      },
      {
        returnType: 'boolean',
        arguments: ['vec4', 'vec4'],
        formula: '($0 == $1)',
      },
    ],
    '!==': [
      {
        returnType: 'boolean',
        arguments: ['number', 'number'],
        formula: '($0 != $1)',
      },
      {
        returnType: 'boolean',
        arguments: ['vec2', 'vec2'],
        formula: '($0 != $1)',
      },
      {
        returnType: 'boolean',
        arguments: ['vec3', 'vec3'],
        formula: '($0 != $1)',
      },
      {
        returnType: 'boolean',
        arguments: ['vec4', 'vec4'],
        formula: '($0 != $1)',
      },
    ],
    '<': [
      {
        returnType: 'boolean',
        arguments: ['number', 'number'],
        formula: '($0 < $1)',
      },
    ],
    '<=': [
      {
        returnType: 'boolean',
        arguments: ['number', 'number'],
        formula: '($0 <= $1)',
      },
    ],
    '>': [
      {
        returnType: 'boolean',
        arguments: ['number', 'number'],
        formula: '($0 > $1)',
      },
    ],
    '>=': [
      {
        returnType: 'boolean',
        arguments: ['number', 'number'],
        formula: '($0 >= $1)',
      },
    ],
    '+': [
      {
        returnType: 'number',
        arguments: ['number', 'number'],
        formula: '($0 + $1)',
      },
    ],
    '-': [
      {
        returnType: 'number',
        arguments: ['number', 'number'],
        formula: '($0 - $1)',
      },
    ],
    '*': [
      {
        returnType: 'number',
        arguments: ['number', 'number'],
        formula: '($0 * $1)',
      },
    ],
    '/': [
      {
        returnType: 'number',
        arguments: ['number', 'number'],
        formula: '($0 / $1)',
      },
    ],
    '%': [
      {
        returnType: 'number',
        arguments: ['number', 'number'],
        formula: '($0 % $1)',
      },
    ],
    '**': [
      {
        returnType: 'number',
        arguments: ['number', 'number'],
        formula: 'pow($0, $1)',
      },
    ],
    '||': [
      {
        returnType: 'boolean',
        arguments: ['boolean', 'boolean'],
        formula: '($0 || $1)',
      },
    ],
    '&&': [
      {
        returnType: 'boolean',
        arguments: ['boolean', 'boolean'],
        formula: '($0 && $1)',
      },
    ],
    '?:': [
      {
        returnType: 'number',
        arguments: ['boolean', 'number', 'number'],
        formula: 'select($2, $1, $0)',
      },
      {
        returnType: 'vec2',
        arguments: ['boolean', 'vec2', 'vec2'],
        formula: 'select($2, $1, $0)',
      },
      {
        returnType: 'vec3',
        arguments: ['boolean', 'vec3', 'vec3'],
        formula: 'select($2, $1, $0)',
      },
      {
        returnType: 'vec4',
        arguments: ['boolean', 'vec4', 'vec4'],
        formula: 'select($2, $1, $0)',
      },
    ],
    '!': [
      {
        returnType: 'boolean',
        arguments: ['boolean'],
        formula: '!$0',
      },
    ],
  },
  vec2: {
    plus: [
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        formula: '($0 + $1)',
      },
    ],
    minus: [
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        formula: '($0 - $1)',
      },
    ],
    times: [
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        formula: '($0 * $1)',
      },
      {
        returnType: 'vec2',
        arguments: ['number'],
        formula: '($0 * $1)',
      },
    ],
    cplxTimes: [
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        formula: 'cplxTimes($0, $1)',
      },
    ],
    div: [
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        formula: '($0 / $1)',
      },
      {
        returnType: 'vec2',
        arguments: ['number'],
        formula: '($0 / $1)',
      },
    ],
    dot: [
      {
        returnType: 'number',
        arguments: ['vec2'],
        formula: 'dot($0, $1)',
      },
    ],
    length: [
      {
        returnType: 'number',
        arguments: [],
        formula: 'length(vec2<f32>($0))',
      },
    ],
    normalized: [
      {
        returnType: 'vec2',
        arguments: [],
        formula: 'normalize($0)',
      },
    ],
    dist: [
      {
        returnType: 'number',
        arguments: ['vec2'],
        formula: 'distance($0, $1)',
      },
    ],
    abs: [
      {
        returnType: 'vec2',
        arguments: [],
        formula: 'abs($0)',
      },
    ],
    acos: [
      {
        returnType: 'vec2',
        arguments: [],
        formula: 'acos($0)',
      },
    ],
    acosh: [
      {
        returnType: 'vec2',
        arguments: [],
        formula: 'acosh($0)',
      },
    ],
    asin: [
      {
        returnType: 'vec2',
        arguments: [],
        formula: 'asin($0)',
      },
    ],
    asinh: [
      {
        returnType: 'vec2',
        arguments: [],
        formula: 'asinh($0)',
      },
    ],
    atan: [
      {
        returnType: 'vec2',
        arguments: [],
        formula: 'atan($0)',
      },
    ],
    atanh: [
      {
        returnType: 'vec2',
        arguments: [],
        formula: 'atanh($0)',
      },
    ],
    atan2: [
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        formula: 'atan2($0, $1)',
      },
    ],
    ceil: [
      {
        returnType: 'vec2',
        arguments: [],
        formula: 'ceil($0)',
      },
    ],
    cos: [
      {
        returnType: 'vec2',
        arguments: [],
        formula: 'cos($0)',
      },
    ],
    cosh: [
      {
        returnType: 'vec2',
        arguments: [],
        formula: 'cosh($0)',
      },
    ],
    exp: [
      {
        returnType: 'vec2',
        arguments: [],
        formula: 'exp($0)',
      },
    ],
    floor: [
      {
        returnType: 'vec2',
        arguments: [],
        formula: 'floor($0)',
      },
    ],
    log: [
      {
        returnType: 'vec2',
        arguments: [],
        formula: 'log($0)',
      },
    ],
    log2: [
      {
        returnType: 'vec2',
        arguments: [],
        formula: 'log2($0)',
      },
    ],
    max: [
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        formula: 'max($0, $1)',
      },
    ],
    min: [
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        formula: 'min($0, $1)',
      },
    ],
    pow: [
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        formula: 'pow($0, $1)',
      },
    ],
    round: [
      {
        returnType: 'vec2',
        arguments: [],
        formula: 'round($0)',
      },
    ],
    sign: [
      {
        returnType: 'vec2',
        arguments: [],
        formula: 'sign($0)',
      },
    ],
    sin: [
      {
        returnType: 'vec2',
        arguments: [],
        formula: 'sin($0)',
      },
    ],
    sinh: [
      {
        returnType: 'vec2',
        arguments: [],
        formula: 'sinh($0)',
      },
    ],
    sqrt: [
      {
        returnType: 'vec2',
        arguments: [],
        formula: 'sqrt($0)',
      },
    ],
    tan: [
      {
        returnType: 'vec2',
        arguments: [],
        formula: 'tan($0)',
      },
    ],
    tanh: [
      {
        returnType: 'vec2',
        arguments: [],
        formula: 'tanh($0)',
      },
    ],
    trunc: [
      {
        returnType: 'vec2',
        arguments: [],
        formula: 'trunc($0)',
      },
    ],
  },
  vec3: {
    plus: [
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        formula: '($0 + $1)',
      },
    ],
    minus: [
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        formula: '($0 - $1)',
      },
    ],
    times: [
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        formula: '($0 * $1)',
      },
      {
        returnType: 'vec3',
        arguments: ['number'],
        formula: '($0 * $1)',
      },
    ],
    div: [
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        formula: '($0 / $1)',
      },
      {
        returnType: 'vec3',
        arguments: ['number'],
        formula: '($0 / $1)',
      },
    ],
    dot: [
      {
        returnType: 'number',
        arguments: ['vec3'],
        formula: 'dot($0, $1)',
      },
    ],
    cross: [
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        formula: 'cross($0, $1)',
      },
    ],
    length: [
      {
        returnType: 'number',
        arguments: [],
        formula: 'length(vec3<f32>($0))',
      },
    ],
    normalized: [
      {
        returnType: 'vec3',
        arguments: [],
        formula: 'normalize($0)',
      },
    ],
    dist: [
      {
        returnType: 'number',
        arguments: ['vec3'],
        formula: 'distance($0, $1)',
      },
    ],
    abs: [
      {
        returnType: 'vec3',
        arguments: [],
        formula: 'abs($0)',
      },
    ],
    acos: [
      {
        returnType: 'vec3',
        arguments: [],
        formula: 'acos($0)',
      },
    ],
    acosh: [
      {
        returnType: 'vec3',
        arguments: [],
        formula: 'acosh($0)',
      },
    ],
    asin: [
      {
        returnType: 'vec3',
        arguments: [],
        formula: 'asin($0)',
      },
    ],
    asinh: [
      {
        returnType: 'vec3',
        arguments: [],
        formula: 'asinh($0)',
      },
    ],
    atan: [
      {
        returnType: 'vec3',
        arguments: [],
        formula: 'atan($0)',
      },
    ],
    atanh: [
      {
        returnType: 'vec3',
        arguments: [],
        formula: 'atanh($0)',
      },
    ],
    atan2: [
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        formula: 'atan2($0, $1)',
      },
    ],
    ceil: [
      {
        returnType: 'vec3',
        arguments: [],
        formula: 'ceil($0)',
      },
    ],
    cos: [
      {
        returnType: 'vec3',
        arguments: [],
        formula: 'cos($0)',
      },
    ],
    cosh: [
      {
        returnType: 'vec3',
        arguments: [],
        formula: 'cosh($0)',
      },
    ],
    exp: [
      {
        returnType: 'vec3',
        arguments: [],
        formula: 'exp($0)',
      },
    ],
    floor: [
      {
        returnType: 'vec3',
        arguments: [],
        formula: 'floor($0)',
      },
    ],
    log: [
      {
        returnType: 'vec3',
        arguments: [],
        formula: 'log($0)',
      },
    ],
    log2: [
      {
        returnType: 'vec3',
        arguments: [],
        formula: 'log2($0)',
      },
    ],
    max: [
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        formula: 'max($0, $1)',
      },
    ],
    min: [
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        formula: 'min($0, $1)',
      },
    ],
    pow: [
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        formula: 'pow($0, $1)',
      },
    ],
    round: [
      {
        returnType: 'vec3',
        arguments: [],
        formula: 'round($0)',
      },
    ],
    sign: [
      {
        returnType: 'vec3',
        arguments: [],
        formula: 'sign($0)',
      },
    ],
    sin: [
      {
        returnType: 'vec3',
        arguments: [],
        formula: 'sin($0)',
      },
    ],
    sinh: [
      {
        returnType: 'vec3',
        arguments: [],
        formula: 'sinh($0)',
      },
    ],
    sqrt: [
      {
        returnType: 'vec3',
        arguments: [],
        formula: 'sqrt($0)',
      },
    ],
    tan: [
      {
        returnType: 'vec3',
        arguments: [],
        formula: 'tan($0)',
      },
    ],
    tanh: [
      {
        returnType: 'vec3',
        arguments: [],
        formula: 'tanh($0)',
      },
    ],
    trunc: [
      {
        returnType: 'vec3',
        arguments: [],
        formula: 'trunc($0)',
      },
    ],
  },
  vec4: {
    plus: [
      {
        returnType: 'vec4',
        arguments: ['vec4'],
        formula: '($0 + $1)',
      },
    ],
    minus: [
      {
        returnType: 'vec4',
        arguments: ['vec4'],
        formula: '($0 - $1)',
      },
    ],
    times: [
      {
        returnType: 'vec4',
        arguments: ['vec4'],
        formula: '($0 * $1)',
      },
      {
        returnType: 'vec4',
        arguments: ['number'],
        formula: '($0 * $1)',
      },
    ],
    div: [
      {
        returnType: 'vec4',
        arguments: ['vec4'],
        formula: '($0 / $1)',
      },
      {
        returnType: 'vec4',
        arguments: ['number'],
        formula: '($0 / $1)',
      },
    ],
    dot: [
      {
        returnType: 'number',
        arguments: ['vec4'],
        formula: 'dot($0, $1)',
      },
    ],
    length: [
      {
        returnType: 'number',
        arguments: [],
        formula: 'length(vec4<f32>($0))',
      },
    ],
    normalized: [
      {
        returnType: 'vec4',
        arguments: [],
        formula: 'normalize($0)',
      },
    ],
    dist: [
      {
        returnType: 'number',
        arguments: ['vec4'],
        formula: 'distance($0, $1)',
      },
    ],
    abs: [
      {
        returnType: 'vec4',
        arguments: [],
        formula: 'abs($0)',
      },
    ],
    acos: [
      {
        returnType: 'vec4',
        arguments: [],
        formula: 'acos($0)',
      },
    ],
    acosh: [
      {
        returnType: 'vec4',
        arguments: [],
        formula: 'acosh($0)',
      },
    ],
    asin: [
      {
        returnType: 'vec4',
        arguments: [],
        formula: 'asin($0)',
      },
    ],
    asinh: [
      {
        returnType: 'vec4',
        arguments: [],
        formula: 'asinh($0)',
      },
    ],
    atan: [
      {
        returnType: 'vec4',
        arguments: [],
        formula: 'atan($0)',
      },
    ],
    atanh: [
      {
        returnType: 'vec4',
        arguments: [],
        formula: 'atanh($0)',
      },
    ],
    atan2: [
      {
        returnType: 'vec4',
        arguments: ['vec4'],
        formula: 'atan2($0, $1)',
      },
    ],
    ceil: [
      {
        returnType: 'vec4',
        arguments: [],
        formula: 'ceil($0)',
      },
    ],
    cos: [
      {
        returnType: 'vec4',
        arguments: [],
        formula: 'cos($0)',
      },
    ],
    cosh: [
      {
        returnType: 'vec4',
        arguments: [],
        formula: 'cosh($0)',
      },
    ],
    exp: [
      {
        returnType: 'vec4',
        arguments: [],
        formula: 'exp($0)',
      },
    ],
    floor: [
      {
        returnType: 'vec4',
        arguments: [],
        formula: 'floor($0)',
      },
    ],
    log: [
      {
        returnType: 'vec4',
        arguments: [],
        formula: 'log($0)',
      },
    ],
    log2: [
      {
        returnType: 'vec4',
        arguments: [],
        formula: 'log2($0)',
      },
    ],
    max: [
      {
        returnType: 'vec4',
        arguments: ['vec4'],
        formula: 'max($0, $1)',
      },
    ],
    min: [
      {
        returnType: 'vec4',
        arguments: ['vec4'],
        formula: 'min($0, $1)',
      },
    ],
    pow: [
      {
        returnType: 'vec4',
        arguments: ['vec4'],
        formula: 'pow($0, $1)',
      },
    ],
    round: [
      {
        returnType: 'vec4',
        arguments: [],
        formula: 'round($0)',
      },
    ],
    sign: [
      {
        returnType: 'vec4',
        arguments: [],
        formula: 'sign($0)',
      },
    ],
    sin: [
      {
        returnType: 'vec4',
        arguments: [],
        formula: 'sin($0)',
      },
    ],
    sinh: [
      {
        returnType: 'vec4',
        arguments: [],
        formula: 'sinh($0)',
      },
    ],
    sqrt: [
      {
        returnType: 'vec4',
        arguments: [],
        formula: 'sqrt($0)',
      },
    ],
    tan: [
      {
        returnType: 'vec4',
        arguments: [],
        formula: 'tan($0)',
      },
    ],
    tanh: [
      {
        returnType: 'vec4',
        arguments: [],
        formula: 'tanh($0)',
      },
    ],
    trunc: [
      {
        returnType: 'vec4',
        arguments: [],
        formula: 'trunc($0)',
      },
    ],
  },
  boolean: {},
  number: {},
  unknown: {},
  function: {},
  canvas: {
    setPixel: [
      {
        returnType: 'void',
        arguments: ['number', 'number', 'number', 'number', 'number'],
        formula: 'setPixelv1($1, $2, $3, $4, $5)',
      },
      {
        returnType: 'void',
        arguments: ['vec2', 'number', 'number', 'number'],
        formula: 'setPixelv2($1, $2, $3, $4)',
      },
      {
        returnType: 'void',
        arguments: ['number', 'number', 'vec3'],
        formula: 'setPixelv3($1, $2, $3)',
      },
      {
        returnType: 'void',
        arguments: ['vec2', 'vec3'],
        formula: 'setPixelv4($1, $2)',
      },
    ],
  },
  void: {},
  uniforms: {},
  buffers: {},
  buffer1d: {},
  buffer2d: {},
  buffer3d: {},
  intermediatebuffer: {},
  numberarrayliteral: {},
  vec2arrayliteral: {},
  vec3arrayliteral: {},
  vec4arrayliteral: {},
  booleanarrayliteral: {},
  numberarray: {},
  vec2array: {},
  vec3array: {},
  vec4array: {},
  booleanarray: {},
  numbertype: {},
  vec2type: {},
  vec3type: {},
  vec4type: {},
  booleantype: {},
  types: {},
  inputs: {},
} as {
  [K in VariableType | 'standalone']: {
    [key: string]: {
      returnType: VariableType;
      arguments: VariableType[];
      formula: string;
    }[];
  };
};

export default functions;
