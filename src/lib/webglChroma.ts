// webglChroma.ts

let glContext: WebGLRenderingContext | null = null;
let shaderProgram: WebGLProgram | null = null;
let positionBuffer: WebGLBuffer | null = null;
let texCoordBuffer: WebGLBuffer | null = null;
let texture: WebGLTexture | null = null;

const VERTEX_SHADER = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = vec2(a_texCoord.x, 1.0 - a_texCoord.y); // Flip Y for WebGL texture
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;
  varying vec2 v_texCoord;
  uniform sampler2D u_image;
  
  void main() {
    vec4 color = texture2D(u_image, v_texCoord);
    float r = color.r * 255.0;
    float g = color.g * 255.0;
    float b = color.b * 255.0;
    
    // Menggunakan formula yang lebih toleran terhadap kompresi MP4
    // Karena MP4 selalu merusak warna murni (0,255,0), kita cek dominasi hijau terang.
    // Kita perketat agar warna kuning atau hijau gelap (seperti daun pohon) tidak ikut hilang.
    if (g > 150.0 && g > r * 1.8 && g > b * 1.8 && g - max(r, b) > 80.0) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    } else {
      gl_FragColor = color;
    }
  }
`;

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Gagal membuat shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error("Gagal kompilasi shader: " + info);
  }
  return shader;
}

export function initWebGL(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl", { premultipliedAlpha: false });
  if (!gl) throw new Error("WebGL tidak didukung");
  glContext = gl;

  const vShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

  shaderProgram = gl.createProgram()!;
  gl.attachShader(shaderProgram, vShader);
  gl.attachShader(shaderProgram, fShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    throw new Error("Gagal link shader program: " + gl.getProgramInfoLog(shaderProgram));
  }

  // Setup Buffers (Quad)
  positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1.0, -1.0,  
     1.0, -1.0,  
    -1.0,  1.0,  
    -1.0,  1.0,  
     1.0, -1.0,  
     1.0,  1.0,  
  ]), gl.STATIC_DRAW);

  texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0.0, 0.0,  
    1.0, 0.0,  
    0.0, 1.0,  
    0.0, 1.0,  
    1.0, 0.0,  
    1.0, 1.0,  
  ]), gl.STATIC_DRAW);

  texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  
  return gl;
}

export function renderChromaKey(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
  if (!glContext || !shaderProgram) {
    initWebGL(canvas);
  }
  
  const gl = glContext!;
  
  if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  }

  gl.useProgram(shaderProgram);

  // Upload video frame to texture
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

  // Setup Attributes
  const positionLocation = gl.getAttribLocation(shaderProgram!, "a_position");
  gl.enableVertexAttribArray(positionLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const texCoordLocation = gl.getAttribLocation(shaderProgram!, "a_texCoord");
  gl.enableVertexAttribArray(texCoordLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

  // Draw
  gl.clearColor(0.0, 0.0, 0.0, 0.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}
