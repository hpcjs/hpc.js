import { VariableType } from '../../gpu-backend/types';

const functions = {
  math: {
    abs: [
      {
        returnType: 'number',
        arguments: ['number'],
        gpuFormula: 'abs($1)',
        cpuFormula: 'Math.abs($1)',
      },
    ],
    acos: [
      {
        returnType: 'number',
        arguments: ['number'],
        gpuFormula: 'acos($1)',
        cpuFormula: 'Math.acos($1)',
      },
    ],
    acosh: [
      {
        returnType: 'number',
        arguments: ['number'],
        gpuFormula: 'acosh($1)',
        cpuFormula: 'Math.acosh($1)',
      },
    ],
    asin: [
      {
        returnType: 'number',
        arguments: ['number'],
        gpuFormula: 'asin($1)',
        cpuFormula: 'Math.asin($1)',
      },
    ],
    asinh: [
      {
        returnType: 'number',
        arguments: ['number'],
        gpuFormula: 'asinh($1)',
        cpuFormula: 'Math.asinh($1)',
      },
    ],
    atan: [
      {
        returnType: 'number',
        arguments: ['number'],
        gpuFormula: 'atan($1)',
        cpuFormula: 'Math.atan($1)',
      },
    ],
    atanh: [
      {
        returnType: 'number',
        arguments: ['number'],
        gpuFormula: 'atanh($1)',
        cpuFormula: 'Math.atanh($1)',
      },
    ],
    atan2: [
      {
        returnType: 'number',
        arguments: ['number', 'number'],
        gpuFormula: 'atan2($1, $2)',
        cpuFormula: 'Math.atan2($1, $2)',
      },
    ],
    ceil: [
      {
        returnType: 'number',
        arguments: ['number'],
        gpuFormula: 'ceil($1)',
        cpuFormula: 'Math.ceil($1)',
      },
    ],
    cos: [
      {
        returnType: 'number',
        arguments: ['number'],
        gpuFormula: 'cos($1)',
        cpuFormula: 'Math.cos($1)',
      },
    ],
    cosh: [
      {
        returnType: 'number',
        arguments: ['number'],
        gpuFormula: 'cosh($1)',
        cpuFormula: 'Math.cosh($1)',
      },
    ],
    exp: [
      {
        returnType: 'number',
        arguments: ['number'],
        gpuFormula: 'exp($1)',
        cpuFormula: 'Math.exp($1)',
      },
    ],
    floor: [
      {
        returnType: 'number',
        arguments: ['number'],
        gpuFormula: 'floor($1)',
        cpuFormula: 'Math.floor($1)',
      },
    ],
    log: [
      {
        returnType: 'number',
        arguments: ['number'],
        gpuFormula: 'log($1)',
        cpuFormula: 'Math.log($1)',
      },
    ],
    log2: [
      {
        returnType: 'number',
        arguments: ['number'],
        gpuFormula: 'log2($1)',
        cpuFormula: 'Math.log2($1)',
      },
    ],
    max: [
      {
        returnType: 'number',
        arguments: ['number'],
        gpuFormula: 'max($1)',
        cpuFormula: 'Math.max($1)',
      },
    ],
    min: [
      {
        returnType: 'number',
        arguments: ['number'],
        gpuFormula: 'min($1)',
        cpuFormula: 'Math.min($1)',
      },
    ],
    pow: [
      {
        returnType: 'number',
        arguments: ['number'],
        gpuFormula: 'pow($1)',
        cpuFormula: 'Math.pow($1)',
      },
    ],
    random: [
      {
        returnType: 'number',
        arguments: [],
        gpuFormula: 'hpcjsRand()',
        cpuFormula: 'Math.random()',
      },
    ],
    round: [
      {
        returnType: 'number',
        arguments: ['number'],
        gpuFormula: 'round($1)',
        cpuFormula: 'Math.round($1)',
      },
    ],
    sign: [
      {
        returnType: 'number',
        arguments: ['number'],
        gpuFormula: 'sign($1)',
        cpuFormula: 'Math.sign($1)',
      },
    ],
    sin: [
      {
        returnType: 'number',
        arguments: ['number'],
        gpuFormula: 'sin($1)',
        cpuFormula: 'Math.sin($1)',
      },
    ],
    sinh: [
      {
        returnType: 'number',
        arguments: ['number'],
        gpuFormula: 'sinh($1)',
        cpuFormula: 'Math.sinh($1)',
      },
    ],
    sqrt: [
      {
        returnType: 'number',
        arguments: ['number'],
        gpuFormula: 'sqrt($1)',
        cpuFormula: 'Math.sqrt($1)',
      },
    ],
    tan: [
      {
        returnType: 'number',
        arguments: ['number'],
        gpuFormula: 'tan($1)',
        cpuFormula: 'Math.tan($1)',
      },
    ],
    tanh: [
      {
        returnType: 'number',
        arguments: ['number'],
        gpuFormula: 'tanh($1)',
        cpuFormula: 'Math.tanh($1)',
      },
    ],
    trunc: [
      {
        returnType: 'number',
        arguments: ['number'],
        gpuFormula: 'trunc($1)',
        cpuFormula: 'Math.trunc($1)',
      },
    ],
  },
  standalone: {
    dim: [
      {
        returnType: 'number',
        arguments: ['numberarray'],
        gpuFormula: 'f32($s)',
        cpuFormula: '($s)',
      },
      {
        returnType: 'number',
        arguments: ['vec2array'],
        gpuFormula: 'f32($s)',
        cpuFormula: '($s)',
      },
      {
        returnType: 'number',
        arguments: ['vec3array'],
        gpuFormula: 'f32($s)',
        cpuFormula: '($s)',
      },
      {
        returnType: 'number',
        arguments: ['vec4array'],
        gpuFormula: 'f32($s)',
        cpuFormula: '($s)',
      },
      {
        returnType: 'number',
        arguments: ['booleanarray'],
        gpuFormula: 'f32($s)',
        cpuFormula: '($s)',
      },
      {
        returnType: 'number',
        arguments: ['buffer1dnumber'],
        gpuFormula: 'f32($s)',
        cpuFormula: '($s)',
      },
      {
        returnType: 'number',
        arguments: ['buffer1dvec2'],
        gpuFormula: 'f32($s)',
        cpuFormula: '($s)',
      },
      {
        returnType: 'number',
        arguments: ['buffer1dvec3'],
        gpuFormula: 'f32($s)',
        cpuFormula: '($s)',
      },
      {
        returnType: 'number',
        arguments: ['buffer1dvec4'],
        gpuFormula: 'f32($s)',
        cpuFormula: '($s)',
      },
      {
        returnType: 'vec2',
        arguments: ['buffer2dnumber'],
        gpuFormula: 'vec2<f32>($s)',
        cpuFormula: 'vec2($s)',
      },
      {
        returnType: 'vec2',
        arguments: ['buffer2dvec2'],
        gpuFormula: 'vec2<f32>($s)',
        cpuFormula: 'vec2($s)',
      },
      {
        returnType: 'vec2',
        arguments: ['buffer2dvec3'],
        gpuFormula: 'vec2<f32>($s)',
        cpuFormula: 'vec2($s)',
      },
      {
        returnType: 'vec2',
        arguments: ['buffer2dvec4'],
        gpuFormula: 'vec2<f32>($s)',
        cpuFormula: 'vec2($s)',
      },
      {
        returnType: 'vec3',
        arguments: ['buffer3dnumber'],
        gpuFormula: 'vec3<f32>($s)',
        cpuFormula: 'vec3($s)',
      },
      {
        returnType: 'vec3',
        arguments: ['buffer3dvec2'],
        gpuFormula: 'vec3<f32>($s)',
        cpuFormula: 'vec3($s)',
      },
      {
        returnType: 'vec3',
        arguments: ['buffer3dvec3'],
        gpuFormula: 'vec3<f32>($s)',
        cpuFormula: 'vec3($s)',
      },
      {
        returnType: 'vec3',
        arguments: ['buffer3dvec4'],
        gpuFormula: 'vec3<f32>($s)',
        cpuFormula: 'vec3($s)',
      },
    ],
    array: [
      {
        returnType: 'numberarray',
        arguments: ['number', 'number'],
        gpuFormula: 'array<f32, $0>($r)',
        cpuFormula: '(new Array($0)).fill($r)',
      },
      {
        returnType: 'numberarray',
        arguments: ['numberarrayliteral'],
        gpuFormula: 'array<f32, $s>($0)',
        cpuFormula: '[$0]',
      },
      {
        returnType: 'vec2array',
        arguments: ['number', 'vec2'],
        gpuFormula: 'array<vec2<f32>, $0>($r)',
        cpuFormula: '(new Array($0)).fill($r)',
      },
      {
        returnType: 'vec2array',
        arguments: ['vec2arrayliteral'],
        gpuFormula: 'array<vec2<f32>, $s>($0)',
        cpuFormula: '[$0]',
      },
      {
        returnType: 'vec3array',
        arguments: ['number', 'vec3'],
        gpuFormula: 'array<vec3<f32>, $0>($r)',
        cpuFormula: '(new Array($0)).fill($r)',
      },
      {
        returnType: 'vec3array',
        arguments: ['vec3arrayliteral'],
        gpuFormula: 'array<vec3<f32>, $s>($0)',
        cpuFormula: '[$0]',
      },
      {
        returnType: 'vec4array',
        arguments: ['number', 'vec4'],
        gpuFormula: 'array<vec4<f32>, $0>($r)',
        cpuFormula: '(new Array($0)).fill($r)',
      },
      {
        returnType: 'vec4array',
        arguments: ['vec4arrayliteral'],
        gpuFormula: 'array<vec4<f32>, $s>($0)',
        cpuFormula: '[$0]',
      },
      {
        returnType: 'booleanarray',
        arguments: ['number', 'boolean'],
        gpuFormula: 'array<bool, $0>($r)',
        cpuFormula: '(new Array($0)).fill($r)',
      },
      {
        returnType: 'booleanarray',
        arguments: ['booleanarrayliteral'],
        gpuFormula: 'array<bool, $s>($0)',
        cpuFormula: '[$0]',
      },
    ],
    vec2: [
      {
        returnType: 'vec2',
        arguments: ['number', 'number'],
        gpuFormula: 'vec2<f32>($0, $1)',
        cpuFormula: 'vec2($0, $1)',
      },
      {
        returnType: 'vec2',
        arguments: ['number'],
        gpuFormula: 'vec2<f32>($0)',
        cpuFormula: 'vec2($0)',
      },
    ],
    vec3: [
      {
        returnType: 'vec3',
        arguments: ['number', 'number', 'number'],
        gpuFormula: 'vec3<f32>($0, $1, $2)',
        cpuFormula: 'vec3($0, $1, $2)',
      },
      {
        returnType: 'vec3',
        arguments: ['number'],
        gpuFormula: 'vec3<f32>($0)',
        cpuFormula: 'vec3($0)',
      },
    ],
    vec4: [
      {
        returnType: 'vec4',
        arguments: ['number', 'number', 'number', 'number'],
        gpuFormula: 'vec4<f32>($0, $1, $2, $3)',
        cpuFormula: 'vec4($0, $1, $2, $3)',
      },
      {
        returnType: 'vec4',
        arguments: ['number'],
        gpuFormula: 'vec4<f32>($0)',
        cpuFormula: 'vec4($0)',
      },
    ],
    '==': [
      {
        returnType: 'boolean',
        arguments: ['number', 'number'],
        gpuFormula: '($0 == $1)',
        cpuFormula: '($0 == $1)',
      },
      {
        returnType: 'boolean',
        arguments: ['vec2', 'vec2'],
        gpuFormula: '($0 == $1)',
        cpuFormula: '($0.equals($1))',
      },
      {
        returnType: 'boolean',
        arguments: ['vec3', 'vec3'],
        gpuFormula: '($0 == $1)',
        cpuFormula: '($0.equals($1))',
      },
      {
        returnType: 'boolean',
        arguments: ['vec4', 'vec4'],
        gpuFormula: '($0 == $1)',
        cpuFormula: '($0.equals($1))',
      },
    ],
    '!=': [
      {
        returnType: 'boolean',
        arguments: ['number', 'number'],
        gpuFormula: '($0 != $1)',
        cpuFormula: '($0 != $1)',
      },
      {
        returnType: 'boolean',
        arguments: ['vec2', 'vec2'],
        gpuFormula: '($0 != $1)',
        cpuFormula: '($0.notEquals($1))',
      },
      {
        returnType: 'boolean',
        arguments: ['vec3', 'vec3'],
        gpuFormula: '($0 != $1)',
        cpuFormula: '($0.notEquals($1))',
      },
      {
        returnType: 'boolean',
        arguments: ['vec4', 'vec4'],
        gpuFormula: '($0 != $1)',
        cpuFormula: '($0.notEquals($1))',
      },
    ],
    '===': [
      {
        returnType: 'boolean',
        arguments: ['number', 'number'],
        gpuFormula: '($0 == $1)',
        cpuFormula: '($0 == $1)',
      },
      {
        returnType: 'boolean',
        arguments: ['vec2', 'vec2'],
        gpuFormula: '($0 == $1)',
        cpuFormula: '($0.equals($1))',
      },
      {
        returnType: 'boolean',
        arguments: ['vec3', 'vec3'],
        gpuFormula: '($0 == $1)',
        cpuFormula: '($0.equals($1))',
      },
      {
        returnType: 'boolean',
        arguments: ['vec4', 'vec4'],
        gpuFormula: '($0 == $1)',
        cpuFormula: '($0.equals($1))',
      },
    ],
    '!==': [
      {
        returnType: 'boolean',
        arguments: ['number', 'number'],
        gpuFormula: '($0 != $1)',
        cpuFormula: '($0 != $1)',
      },
      {
        returnType: 'boolean',
        arguments: ['vec2', 'vec2'],
        gpuFormula: '($0 != $1)',
        cpuFormula: '($0.notEquals($1))',
      },
      {
        returnType: 'boolean',
        arguments: ['vec3', 'vec3'],
        gpuFormula: '($0 != $1)',
        cpuFormula: '($0.notEquals($1))',
      },
      {
        returnType: 'boolean',
        arguments: ['vec4', 'vec4'],
        gpuFormula: '($0 != $1)',
        cpuFormula: '($0.notEquals($1))',
      },
    ],
    '<': [
      {
        returnType: 'boolean',
        arguments: ['number', 'number'],
        gpuFormula: '($0 < $1)',
        cpuFormula: '($0 < $1)',
      },
    ],
    '<=': [
      {
        returnType: 'boolean',
        arguments: ['number', 'number'],
        gpuFormula: '($0 <= $1)',
        cpuFormula: '($0 <= $1)',
      },
    ],
    '>': [
      {
        returnType: 'boolean',
        arguments: ['number', 'number'],
        gpuFormula: '($0 > $1)',
        cpuFormula: '($0 > $1)',
      },
    ],
    '>=': [
      {
        returnType: 'boolean',
        arguments: ['number', 'number'],
        gpuFormula: '($0 >= $1)',
        cpuFormula: '($0 >= $1)',
      },
    ],
    '+': [
      {
        returnType: 'number',
        arguments: ['number', 'number'],
        gpuFormula: '($0 + $1)',
        cpuFormula: '($0 + $1)',
      },
      {
        returnType: 'number',
        arguments: ['number'],
        gpuFormula: '($0)',
        cpuFormula: '($0)',
      },
    ],
    '-': [
      {
        returnType: 'number',
        arguments: ['number', 'number'],
        gpuFormula: '($0 - $1)',
        cpuFormula: '($0 - $1)',
      },
      {
        returnType: 'number',
        arguments: ['number'],
        gpuFormula: '(-$0)',
        cpuFormula: '(-$0)',
      },
    ],
    '*': [
      {
        returnType: 'number',
        arguments: ['number', 'number'],
        gpuFormula: '($0 * $1)',
        cpuFormula: '($0 * $1)',
      },
    ],
    '/': [
      {
        returnType: 'number',
        arguments: ['number', 'number'],
        gpuFormula: '($0 / $1)',
        cpuFormula: '($0 / $1)',
      },
    ],
    '%': [
      {
        returnType: 'number',
        arguments: ['number', 'number'],
        gpuFormula: '($0 % $1)',
        cpuFormula: '($0 % $1)',
      },
    ],
    '**': [
      {
        returnType: 'number',
        arguments: ['number', 'number'],
        gpuFormula: 'pow($0, $1)',
        cpuFormula: 'Math.pow($0, $1)',
      },
    ],
    '||': [
      {
        returnType: 'boolean',
        arguments: ['boolean', 'boolean'],
        gpuFormula: '($0 || $1)',
        cpuFormula: '($0 || $1)',
      },
    ],
    '&&': [
      {
        returnType: 'boolean',
        arguments: ['boolean', 'boolean'],
        gpuFormula: '($0 && $1)',
        cpuFormula: '($0 && $1)',
      },
    ],
    '?:': [
      {
        returnType: 'number',
        arguments: ['boolean', 'number', 'number'],
        gpuFormula: 'select($2, $1, $0)',
        cpuFormula: '($0 ? $1 : $2)',
      },
      {
        returnType: 'vec2',
        arguments: ['boolean', 'vec2', 'vec2'],
        gpuFormula: 'select($2, $1, $0)',
        cpuFormula: '($0 ? $1 : $2)',
      },
      {
        returnType: 'vec3',
        arguments: ['boolean', 'vec3', 'vec3'],
        gpuFormula: 'select($2, $1, $0)',
        cpuFormula: '($0 ? $1 : $2)',
      },
      {
        returnType: 'vec4',
        arguments: ['boolean', 'vec4', 'vec4'],
        gpuFormula: 'select($2, $1, $0)',
        cpuFormula: '($0 ? $1 : $2)',
      },
    ],
    '!': [
      {
        returnType: 'boolean',
        arguments: ['boolean'],
        gpuFormula: '!$0',
        cpuFormula: '!$0',
      },
    ],
  },
  vec2: {
    plus: [
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        gpuFormula: '($0 + $1)',
        cpuFormula: '($0.plus($1))',
      },
    ],
    minus: [
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        gpuFormula: '($0 - $1)',
        cpuFormula: '($0.minus($1))',
      },
    ],
    times: [
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        gpuFormula: '($0 * $1)',
        cpuFormula: '($0.times($1))',
      },
      {
        returnType: 'vec2',
        arguments: ['number'],
        gpuFormula: '($0 * $1)',
        cpuFormula: '($0.times($1))',
      },
    ],
    cplxTimes: [
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        gpuFormula: 'cplxTimes($0, $1)',
        cpuFormula: '$0.cplxTimes($1)',
      },
    ],
    div: [
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        gpuFormula: '($0 / $1)',
        cpuFormula: '($0.div($1))',
      },
      {
        returnType: 'vec2',
        arguments: ['number'],
        gpuFormula: '($0 / $1)',
        cpuFormula: '($0.div($1))',
      },
    ],
    cplxDiv: [
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        gpuFormula: 'cplxDiv($0, $1)',
        cpuFormula: '$0.cplxDiv($1)',
      },
    ],
    cplxConj: [
      {
        returnType: 'vec2',
        arguments: [],
        gpuFormula: 'cplxConj($0)',
        cpuFormula: '$0.cplxConj()',
      },
    ],
    dot: [
      {
        returnType: 'number',
        arguments: ['vec2'],
        gpuFormula: 'dot($0, $1)',
        cpuFormula: '$0.dot($1)',
      },
    ],
    length: [
      {
        returnType: 'number',
        arguments: [],
        gpuFormula: 'length(vec2<f32>($0))',
        cpuFormula: '$0.length()',
      },
    ],
    normalized: [
      {
        returnType: 'vec2',
        arguments: [],
        gpuFormula: 'normalize($0)',
        cpuFormula: '$0.normalized()',
      },
    ],
    dist: [
      {
        returnType: 'number',
        arguments: ['vec2'],
        gpuFormula: 'distance($0, $1)',
        cpuFormula: '$0.dist($1)',
      },
    ],
    abs: [
      {
        returnType: 'vec2',
        arguments: [],
        gpuFormula: 'abs($0)',
        cpuFormula: '$0.abs()',
      },
    ],
    acos: [
      {
        returnType: 'vec2',
        arguments: [],
        gpuFormula: 'acos($0)',
        cpuFormula: '$0.acos()',
      },
    ],
    acosh: [
      {
        returnType: 'vec2',
        arguments: [],
        gpuFormula: 'acosh($0)',
        cpuFormula: '$0.acosh()',
      },
    ],
    asin: [
      {
        returnType: 'vec2',
        arguments: [],
        gpuFormula: 'asin($0)',
        cpuFormula: '$0.asin()',
      },
    ],
    asinh: [
      {
        returnType: 'vec2',
        arguments: [],
        gpuFormula: 'asinh($0)',
        cpuFormula: '$0.asinh()',
      },
    ],
    atan: [
      {
        returnType: 'vec2',
        arguments: [],
        gpuFormula: 'atan($0)',
        cpuFormula: '$0.atan()',
      },
    ],
    atanh: [
      {
        returnType: 'vec2',
        arguments: [],
        gpuFormula: 'atanh($0)',
        cpuFormula: '$0.atanh()',
      },
    ],
    atan2: [
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        gpuFormula: 'atan2($0, $1)',
        cpuFormula: '$0.atan2($1)',
      },
    ],
    ceil: [
      {
        returnType: 'vec2',
        arguments: [],
        gpuFormula: 'ceil($0)',
        cpuFormula: '$0.ceil()',
      },
    ],
    cos: [
      {
        returnType: 'vec2',
        arguments: [],
        gpuFormula: 'cos($0)',
        cpuFormula: '$0.cos()',
      },
    ],
    cosh: [
      {
        returnType: 'vec2',
        arguments: [],
        gpuFormula: 'cosh($0)',
        cpuFormula: '$0.cosh()',
      },
    ],
    exp: [
      {
        returnType: 'vec2',
        arguments: [],
        gpuFormula: 'exp($0)',
        cpuFormula: '$0.exp()',
      },
    ],
    floor: [
      {
        returnType: 'vec2',
        arguments: [],
        gpuFormula: 'floor($0)',
        cpuFormula: '$0.floor()',
      },
    ],
    log: [
      {
        returnType: 'vec2',
        arguments: [],
        gpuFormula: 'log($0)',
        cpuFormula: '$0.log()',
      },
    ],
    log2: [
      {
        returnType: 'vec2',
        arguments: [],
        gpuFormula: 'log2($0)',
        cpuFormula: '$0.log2()',
      },
    ],
    max: [
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        gpuFormula: 'max($0, $1)',
        cpuFormula: '$0.max($1)',
      },
    ],
    min: [
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        gpuFormula: 'min($0, $1)',
        cpuFormula: '$0.min($1)',
      },
    ],
    pow: [
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        gpuFormula: 'pow($0, $1)',
        cpuFormula: '$0.pow($1)',
      },
    ],
    round: [
      {
        returnType: 'vec2',
        arguments: [],
        gpuFormula: 'round($0)',
        cpuFormula: '$0.round()',
      },
    ],
    sign: [
      {
        returnType: 'vec2',
        arguments: [],
        gpuFormula: 'sign($0)',
        cpuFormula: '$0.sign()',
      },
    ],
    sin: [
      {
        returnType: 'vec2',
        arguments: [],
        gpuFormula: 'sin($0)',
        cpuFormula: '$0.sin()',
      },
    ],
    sinh: [
      {
        returnType: 'vec2',
        arguments: [],
        gpuFormula: 'sinh($0)',
        cpuFormula: '$0.sinh()',
      },
    ],
    sqrt: [
      {
        returnType: 'vec2',
        arguments: [],
        gpuFormula: 'sqrt($0)',
        cpuFormula: '$0.sqrt()',
      },
    ],
    tan: [
      {
        returnType: 'vec2',
        arguments: [],
        gpuFormula: 'tan($0)',
        cpuFormula: '$0.tan()',
      },
    ],
    tanh: [
      {
        returnType: 'vec2',
        arguments: [],
        gpuFormula: 'tanh($0)',
        cpuFormula: '$0.tanh()',
      },
    ],
    trunc: [
      {
        returnType: 'vec2',
        arguments: [],
        gpuFormula: 'trunc($0)',
        cpuFormula: '$0.trunc()',
      },
    ],
  },
  vec3: {
    plus: [
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        gpuFormula: '($0 + $1)',
        cpuFormula: '$0.plus($1)',
      },
    ],
    minus: [
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        gpuFormula: '($0 - $1)',
        cpuFormula: '$0.minus($1)',
      },
    ],
    times: [
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        gpuFormula: '($0 * $1)',
        cpuFormula: '$0.times($1)',
      },
      {
        returnType: 'vec3',
        arguments: ['number'],
        gpuFormula: '($0 * $1)',
        cpuFormula: '$0.times($1)',
      },
    ],
    div: [
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        gpuFormula: '($0 / $1)',
        cpuFormula: '$0.div($1)',
      },
      {
        returnType: 'vec3',
        arguments: ['number'],
        gpuFormula: '($0 / $1)',
        cpuFormula: '$0.div($1)',
      },
    ],
    dot: [
      {
        returnType: 'number',
        arguments: ['vec3'],
        gpuFormula: 'dot($0, $1)',
        cpuFormula: '$0.dot($1)',
      },
    ],
    cross: [
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        gpuFormula: 'cross($0, $1)',
        cpuFormula: '$0.cross($1)',
      },
    ],
    length: [
      {
        returnType: 'number',
        arguments: [],
        gpuFormula: 'length(vec3<f32>($0))',
        cpuFormula: '$0.length()',
      },
    ],
    normalized: [
      {
        returnType: 'vec3',
        arguments: [],
        gpuFormula: 'normalize($0)',
        cpuFormula: '$0.normalized()',
      },
    ],
    dist: [
      {
        returnType: 'number',
        arguments: ['vec3'],
        gpuFormula: 'distance($0, $1)',
        cpuFormula: '$0.dist($1)',
      },
    ],
    abs: [
      {
        returnType: 'vec3',
        arguments: [],
        gpuFormula: 'abs($0)',
        cpuFormula: '$0.abs()',
      },
    ],
    acos: [
      {
        returnType: 'vec3',
        arguments: [],
        gpuFormula: 'acos($0)',
        cpuFormula: '$0.acos()',
      },
    ],
    acosh: [
      {
        returnType: 'vec3',
        arguments: [],
        gpuFormula: 'acosh($0)',
        cpuFormula: '$0.acosh()',
      },
    ],
    asin: [
      {
        returnType: 'vec3',
        arguments: [],
        gpuFormula: 'asin($0)',
        cpuFormula: '$0.asin()',
      },
    ],
    asinh: [
      {
        returnType: 'vec3',
        arguments: [],
        gpuFormula: 'asinh($0)',
        cpuFormula: '$0.asinh()',
      },
    ],
    atan: [
      {
        returnType: 'vec3',
        arguments: [],
        gpuFormula: 'atan($0)',
        cpuFormula: '$0.atan()',
      },
    ],
    atanh: [
      {
        returnType: 'vec3',
        arguments: [],
        gpuFormula: 'atanh($0)',
        cpuFormula: '$0.atanh()',
      },
    ],
    atan2: [
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        gpuFormula: 'atan2($0, $1)',
        cpuFormula: '$0.atan2($1)',
      },
    ],
    ceil: [
      {
        returnType: 'vec3',
        arguments: [],
        gpuFormula: 'ceil($0)',
        cpuFormula: '$0.ceil()',
      },
    ],
    cos: [
      {
        returnType: 'vec3',
        arguments: [],
        gpuFormula: 'cos($0)',
        cpuFormula: '$0.cos()',
      },
    ],
    cosh: [
      {
        returnType: 'vec3',
        arguments: [],
        gpuFormula: 'cosh($0)',
        cpuFormula: '$0.cosh()',
      },
    ],
    exp: [
      {
        returnType: 'vec3',
        arguments: [],
        gpuFormula: 'exp($0)',
        cpuFormula: '$0.exp()',
      },
    ],
    floor: [
      {
        returnType: 'vec3',
        arguments: [],
        gpuFormula: 'floor($0)',
        cpuFormula: '$0.floor()',
      },
    ],
    log: [
      {
        returnType: 'vec3',
        arguments: [],
        gpuFormula: 'log($0)',
        cpuFormula: '$0.log()',
      },
    ],
    log2: [
      {
        returnType: 'vec3',
        arguments: [],
        gpuFormula: 'log2($0)',
        cpuFormula: '$0.log2()',
      },
    ],
    max: [
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        gpuFormula: 'max($0, $1)',
        cpuFormula: '$0.max($1)',
      },
    ],
    min: [
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        gpuFormula: 'min($0, $1)',
        cpuFormula: '$0.min($1)',
      },
    ],
    pow: [
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        gpuFormula: 'pow($0, $1)',
        cpuFormula: '$0.pow($1)',
      },
    ],
    round: [
      {
        returnType: 'vec3',
        arguments: [],
        gpuFormula: 'round($0)',
        cpuFormula: '$0.round()',
      },
    ],
    sign: [
      {
        returnType: 'vec3',
        arguments: [],
        gpuFormula: 'sign($0)',
        cpuFormula: '$0.sign()',
      },
    ],
    sin: [
      {
        returnType: 'vec3',
        arguments: [],
        gpuFormula: 'sin($0)',
        cpuFormula: '$0.sin()',
      },
    ],
    sinh: [
      {
        returnType: 'vec3',
        arguments: [],
        gpuFormula: 'sinh($0)',
        cpuFormula: '$0.sinh()',
      },
    ],
    sqrt: [
      {
        returnType: 'vec3',
        arguments: [],
        gpuFormula: 'sqrt($0)',
        cpuFormula: '$0.sqrt()',
      },
    ],
    tan: [
      {
        returnType: 'vec3',
        arguments: [],
        gpuFormula: 'tan($0)',
        cpuFormula: '$0.tan()',
      },
    ],
    tanh: [
      {
        returnType: 'vec3',
        arguments: [],
        gpuFormula: 'tanh($0)',
        cpuFormula: '$0.tanh()',
      },
    ],
    trunc: [
      {
        returnType: 'vec3',
        arguments: [],
        gpuFormula: 'trunc($0)',
        cpuFormula: '$0.trunc()',
      },
    ],
  },
  vec4: {
    plus: [
      {
        returnType: 'vec4',
        arguments: ['vec4'],
        gpuFormula: '($0 + $1)',
        cpuFormula: '$0.plus($1)',
      },
    ],
    minus: [
      {
        returnType: 'vec4',
        arguments: ['vec4'],
        gpuFormula: '($0 - $1)',
        cpuFormula: '$0.minus($1)',
      },
    ],
    times: [
      {
        returnType: 'vec4',
        arguments: ['vec4'],
        gpuFormula: '($0 * $1)',
        cpuFormula: '$0.times($1)',
      },
      {
        returnType: 'vec4',
        arguments: ['number'],
        gpuFormula: '($0 * $1)',
        cpuFormula: '$0.times($1)',
      },
    ],
    div: [
      {
        returnType: 'vec4',
        arguments: ['vec4'],
        gpuFormula: '($0 / $1)',
        cpuFormula: '$0.div($1)',
      },
      {
        returnType: 'vec4',
        arguments: ['number'],
        gpuFormula: '($0 / $1)',
        cpuFormula: '$0.div($1)',
      },
    ],
    dot: [
      {
        returnType: 'number',
        arguments: ['vec4'],
        gpuFormula: 'dot($0, $1)',
        cpuFormula: '$0.dot($1)',
      },
    ],
    length: [
      {
        returnType: 'number',
        arguments: [],
        gpuFormula: 'length(vec4<f32>($0))',
        cpuFormula: '$0.length()',
      },
    ],
    normalized: [
      {
        returnType: 'vec4',
        arguments: [],
        gpuFormula: 'normalize($0)',
        cpuFormula: '$0.normalized()',
      },
    ],
    dist: [
      {
        returnType: 'number',
        arguments: ['vec4'],
        gpuFormula: 'distance($0, $1)',
        cpuFormula: '$0.dist($1)',
      },
    ],
    abs: [
      {
        returnType: 'vec4',
        arguments: [],
        gpuFormula: 'abs($0)',
        cpuFormula: '$0.abs()',
      },
    ],
    acos: [
      {
        returnType: 'vec4',
        arguments: [],
        gpuFormula: 'acos($0)',
        cpuFormula: '$0.acos()',
      },
    ],
    acosh: [
      {
        returnType: 'vec4',
        arguments: [],
        gpuFormula: 'acosh($0)',
        cpuFormula: '$0.acosh()',
      },
    ],
    asin: [
      {
        returnType: 'vec4',
        arguments: [],
        gpuFormula: 'asin($0)',
        cpuFormula: '$0.asin()',
      },
    ],
    asinh: [
      {
        returnType: 'vec4',
        arguments: [],
        gpuFormula: 'asinh($0)',
        cpuFormula: '$0.asinh()',
      },
    ],
    atan: [
      {
        returnType: 'vec4',
        arguments: [],
        gpuFormula: 'atan($0)',
        cpuFormula: '$0.atan()',
      },
    ],
    atanh: [
      {
        returnType: 'vec4',
        arguments: [],
        gpuFormula: 'atanh($0)',
        cpuFormula: '$0.atanh()',
      },
    ],
    atan2: [
      {
        returnType: 'vec4',
        arguments: ['vec4'],
        gpuFormula: 'atan2($0, $1)',
        cpuFormula: '$0.atan2($1)',
      },
    ],
    ceil: [
      {
        returnType: 'vec4',
        arguments: [],
        gpuFormula: 'ceil($0)',
        cpuFormula: '$0.ceil()',
      },
    ],
    cos: [
      {
        returnType: 'vec4',
        arguments: [],
        gpuFormula: 'cos($0)',
        cpuFormula: '$0.cos()',
      },
    ],
    cosh: [
      {
        returnType: 'vec4',
        arguments: [],
        gpuFormula: 'cosh($0)',
        cpuFormula: '$0.cosh()',
      },
    ],
    exp: [
      {
        returnType: 'vec4',
        arguments: [],
        gpuFormula: 'exp($0)',
        cpuFormula: '$0.exp()',
      },
    ],
    floor: [
      {
        returnType: 'vec4',
        arguments: [],
        gpuFormula: 'floor($0)',
        cpuFormula: '$0.floor()',
      },
    ],
    log: [
      {
        returnType: 'vec4',
        arguments: [],
        gpuFormula: 'log($0)',
        cpuFormula: '$0.log()',
      },
    ],
    log2: [
      {
        returnType: 'vec4',
        arguments: [],
        gpuFormula: 'log2($0)',
        cpuFormula: '$0.log2()',
      },
    ],
    max: [
      {
        returnType: 'vec4',
        arguments: ['vec4'],
        gpuFormula: 'max($0, $1)',
        cpuFormula: '$0.max($1)',
      },
    ],
    min: [
      {
        returnType: 'vec4',
        arguments: ['vec4'],
        gpuFormula: 'min($0, $1)',
        cpuFormula: '$0.min($1)',
      },
    ],
    pow: [
      {
        returnType: 'vec4',
        arguments: ['vec4'],
        gpuFormula: 'pow($0, $1)',
        cpuFormula: '$0.pow($1)',
      },
    ],
    round: [
      {
        returnType: 'vec4',
        arguments: [],
        gpuFormula: 'round($0)',
        cpuFormula: '$0.round()',
      },
    ],
    sign: [
      {
        returnType: 'vec4',
        arguments: [],
        gpuFormula: 'sign($0)',
        cpuFormula: '$0.sign()',
      },
    ],
    sin: [
      {
        returnType: 'vec4',
        arguments: [],
        gpuFormula: 'sin($0)',
        cpuFormula: '$0.sin()',
      },
    ],
    sinh: [
      {
        returnType: 'vec4',
        arguments: [],
        gpuFormula: 'sinh($0)',
        cpuFormula: '$0.sinh()',
      },
    ],
    sqrt: [
      {
        returnType: 'vec4',
        arguments: [],
        gpuFormula: 'sqrt($0)',
        cpuFormula: '$0.sqrt()',
      },
    ],
    tan: [
      {
        returnType: 'vec4',
        arguments: [],
        gpuFormula: 'tan($0)',
        cpuFormula: '$0.tan()',
      },
    ],
    tanh: [
      {
        returnType: 'vec4',
        arguments: [],
        gpuFormula: 'tanh($0)',
        cpuFormula: '$0.tanh()',
      },
    ],
    trunc: [
      {
        returnType: 'vec4',
        arguments: [],
        gpuFormula: 'trunc($0)',
        cpuFormula: '$0.trunc()',
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
        gpuFormula: 'setPixelv1($1, $2, $3, $4, $5)',
        cpuFormula: 'setPixelv1($1, $2, $3, $4, $5)',
      },
      {
        returnType: 'void',
        arguments: ['vec2', 'number', 'number', 'number'],
        gpuFormula: 'setPixelv2($1, $2, $3, $4)',
        cpuFormula: 'setPixelv2($1, $2, $3, $4)',
      },
      {
        returnType: 'void',
        arguments: ['number', 'number', 'vec3'],
        gpuFormula: 'setPixelv3($1, $2, $3)',
        cpuFormula: 'setPixelv3($1, $2, $3)',
      },
      {
        returnType: 'void',
        arguments: ['vec2', 'vec3'],
        gpuFormula: 'setPixelv4($1, $2)',
        cpuFormula: 'setPixelv4($1, $2)',
      },
    ],
  },
  void: {},
  uniforms: {},
  buffers: {},
  buffer1dnumber: {},
  buffer2dnumber: {},
  buffer3dnumber: {},
  buffer1dvec2: {},
  buffer2dvec2: {},
  buffer3dvec2: {},
  buffer1dvec3: {},
  buffer2dvec3: {},
  buffer3dvec3: {},
  buffer1dvec4: {},
  buffer2dvec4: {},
  buffer3dvec4: {},
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
      gpuFormula: string;
      cpuFormula: string;
    }[];
  };
};

export default functions;
