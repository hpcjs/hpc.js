import { VariableType } from '../types';

const functions = {
  math: {
    abs: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'abs($1)',
      },
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        formula: 'abs($1)',
      },
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        formula: 'abs($1)',
      },
      {
        returnType: 'vec4',
        arguments: ['vec4'],
        formula: 'abs($1)',
      },
    ],
    acos: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'acos($1)',
      },
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        formula: 'acos($1)',
      },
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        formula: 'acos($1)',
      },
      {
        returnType: 'vec4',
        arguments: ['vec4'],
        formula: 'acos($1)',
      },
    ],
    acosh: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'acosh($1)',
      },
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        formula: 'acosh($1)',
      },
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        formula: 'acosh($1)',
      },
      {
        returnType: 'vec4',
        arguments: ['vec4'],
        formula: 'acosh($1)',
      },
    ],
    asin: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'asin($1)',
      },
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        formula: 'asin($1)',
      },
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        formula: 'asin($1)',
      },
      {
        returnType: 'vec4',
        arguments: ['vec4'],
        formula: 'asin($1)',
      },
    ],
    asinh: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'asinh($1)',
      },
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        formula: 'asinh($1)',
      },
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        formula: 'asinh($1)',
      },
      {
        returnType: 'vec4',
        arguments: ['vec4'],
        formula: 'asinh($1)',
      },
    ],
    atan: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'atan($1)',
      },
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        formula: 'atan($1)',
      },
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        formula: 'atan($1)',
      },
      {
        returnType: 'vec4',
        arguments: ['vec4'],
        formula: 'atan($1)',
      },
    ],
    atanh: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'atanh($1)',
      },
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        formula: 'atanh($1)',
      },
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        formula: 'atanh($1)',
      },
      {
        returnType: 'vec4',
        arguments: ['vec4'],
        formula: 'atanh($1)',
      },
    ],
    atan2: [
      {
        returnType: 'number',
        arguments: ['number', 'number'],
        formula: 'atan2($1, $2)',
      },
      {
        returnType: 'vec2',
        arguments: ['vec2', 'vec2'],
        formula: 'atan2($1, $2)',
      },
      {
        returnType: 'vec3',
        arguments: ['vec3', 'vec3'],
        formula: 'atan2($1, $2)',
      },
      {
        returnType: 'vec4',
        arguments: ['vec4', 'vec4'],
        formula: 'atan2($1, $2)',
      },
    ],
    ceil: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'ceil($1)',
      },
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        formula: 'ceil($1)',
      },
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        formula: 'ceil($1)',
      },
      {
        returnType: 'vec4',
        arguments: ['vec4'],
        formula: 'ceil($1)',
      },
    ],
    cos: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'cos($1)',
      },
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        formula: 'cos($1)',
      },
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        formula: 'cos($1)',
      },
      {
        returnType: 'vec4',
        arguments: ['vec4'],
        formula: 'cos($1)',
      },
    ],
    cosh: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'cosh($1)',
      },
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        formula: 'cosh($1)',
      },
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        formula: 'cosh($1)',
      },
      {
        returnType: 'vec4',
        arguments: ['vec4'],
        formula: 'cosh($1)',
      },
    ],
    exp: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'exp($1)',
      },
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        formula: 'exp($1)',
      },
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        formula: 'exp($1)',
      },
      {
        returnType: 'vec4',
        arguments: ['vec4'],
        formula: 'exp($1)',
      },
    ],
    floor: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'floor($1)',
      },
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        formula: 'floor($1)',
      },
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        formula: 'floor($1)',
      },
      {
        returnType: 'vec4',
        arguments: ['vec4'],
        formula: 'floor($1)',
      },
    ],
    log: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'log($1)',
      },
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        formula: 'log($1)',
      },
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        formula: 'log($1)',
      },
      {
        returnType: 'vec4',
        arguments: ['vec4'],
        formula: 'log($1)',
      },
    ],
    log2: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'log2($1)',
      },
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        formula: 'log2($1)',
      },
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        formula: 'log2($1)',
      },
      {
        returnType: 'vec4',
        arguments: ['vec4'],
        formula: 'log2($1)',
      },
    ],
    max: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'max($1)',
      },
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        formula: 'max($1)',
      },
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        formula: 'max($1)',
      },
      {
        returnType: 'vec4',
        arguments: ['vec4'],
        formula: 'max($1)',
      },
    ],
    min: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'min($1)',
      },
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        formula: 'min($1)',
      },
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        formula: 'min($1)',
      },
      {
        returnType: 'vec4',
        arguments: ['vec4'],
        formula: 'min($1)',
      },
    ],
    pow: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'pow($1)',
      },
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        formula: 'pow($1)',
      },
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        formula: 'pow($1)',
      },
      {
        returnType: 'vec4',
        arguments: ['vec4'],
        formula: 'pow($1)',
      },
    ],
    round: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'round($1)',
      },
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        formula: 'round($1)',
      },
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        formula: 'round($1)',
      },
      {
        returnType: 'vec4',
        arguments: ['vec4'],
        formula: 'round($1)',
      },
    ],
    sign: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'sign($1)',
      },
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        formula: 'sign($1)',
      },
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        formula: 'sign($1)',
      },
      {
        returnType: 'vec4',
        arguments: ['vec4'],
        formula: 'sign($1)',
      },
    ],
    sin: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'sin($1)',
      },
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        formula: 'sin($1)',
      },
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        formula: 'sin($1)',
      },
      {
        returnType: 'vec4',
        arguments: ['vec4'],
        formula: 'sin($1)',
      },
    ],
    sinh: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'sinh($1)',
      },
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        formula: 'sinh($1)',
      },
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        formula: 'sinh($1)',
      },
      {
        returnType: 'vec4',
        arguments: ['vec4'],
        formula: 'sinh($1)',
      },
    ],
    sqrt: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'sqrt($1)',
      },
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        formula: 'sqrt($1)',
      },
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        formula: 'sqrt($1)',
      },
      {
        returnType: 'vec4',
        arguments: ['vec4'],
        formula: 'sqrt($1)',
      },
    ],
    tan: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'tan($1)',
      },
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        formula: 'tan($1)',
      },
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        formula: 'tan($1)',
      },
      {
        returnType: 'vec4',
        arguments: ['vec4'],
        formula: 'tan($1)',
      },
    ],
    tanh: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'tanh($1)',
      },
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        formula: 'tanh($1)',
      },
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        formula: 'tanh($1)',
      },
      {
        returnType: 'vec4',
        arguments: ['vec4'],
        formula: 'tanh($1)',
      },
    ],
    trunc: [
      {
        returnType: 'number',
        arguments: ['number'],
        formula: 'trunc($1)',
      },
      {
        returnType: 'vec2',
        arguments: ['vec2'],
        formula: 'trunc($1)',
      },
      {
        returnType: 'vec3',
        arguments: ['vec3'],
        formula: 'trunc($1)',
      },
      {
        returnType: 'vec4',
        arguments: ['vec4'],
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
    ],
    vec3: [
      {
        returnType: 'vec3',
        arguments: ['number', 'number', 'number'],
        formula: 'vec3<f32>($0, $1, $2)',
      },
    ],
    vec4: [
      {
        returnType: 'vec4',
        arguments: ['number', 'number', 'number', 'number'],
        formula: 'vec4<f32>($0, $1, $2, $3)',
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
    distance: [
      {
        returnType: 'number',
        arguments: ['vec2'],
        formula: 'distance($0, $1)',
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
    distance: [
      {
        returnType: 'number',
        arguments: ['vec3'],
        formula: 'distance($0, $1)',
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
    distance: [
      {
        returnType: 'number',
        arguments: ['vec4'],
        formula: 'distance($0, $1)',
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
