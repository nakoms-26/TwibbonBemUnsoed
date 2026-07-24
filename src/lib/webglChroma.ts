// webglChroma.ts

let glContext: WebGLRenderingContext | null = null;
let shaderProgram: WebGLProgram | null = null;
let positionBuffer: WebGLBuffer | null = null;
let texCoordBuffer: WebGLBuffer | null = null;
let videoTexture: WebGLTexture | null = null;
let imageTexture: WebGLTexture | null = null;
let lastUserImg: HTMLImageElement | null = null;

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
  uniform sampler2D u_video;
  uniform sampler2D u_image;
  uniform vec4 u_crop;
  uniform bool u_hasImage;
  
  void main() {
    vec4 vidColor = texture2D(u_video, v_texCoord);
    float r = vidColor.r * 255.0;
    float g = vidColor.g * 255.0;
    float b = vidColor.b * 255.0;
    
    // Chroma keying khusus untuk warna hijau murni (RGB 0, 255, 0 / #00FF00)
    if (g > 150.0 && r < 80.0 && b < 80.0) {
      if (u_hasImage) {
        vec2 imgUV = vec2(
          u_crop.x + v_texCoord.x * u_crop.z,
          u_crop.y + v_texCoord.y * u_crop.w
        );
        gl_FragColor = texture2D(u_image, imgUV);
      } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
      }
    } else {
      gl_FragColor = vidColor;
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
  const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false, preserveDrawingBuffer: true });
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

  videoTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, videoTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  
  imageTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, imageTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  return gl;
}

export function renderChromaKey(
  video: HTMLVideoElement, 
  canvas: HTMLCanvasElement,
  userImg?: HTMLImageElement,
  crop?: { x: number, y: number, w: number, h: number }
) {
  if (!glContext || !shaderProgram || glContext.canvas !== canvas) {
    initWebGL(canvas);
  }
  
  const gl = glContext!;
  
  if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  }

  gl.useProgram(shaderProgram);

  // Bind video to texture unit 0
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, videoTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
  gl.uniform1i(gl.getUniformLocation(shaderProgram!, "u_video"), 0);

  // Bind image to texture unit 1 (if provided)
  const uHasImage = gl.getUniformLocation(shaderProgram!, "u_hasImage");
  if (userImg && crop) {
    gl.uniform1i(uHasImage, 1);
    
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, imageTexture);
    // Hanya upload ke GPU jika object image baru, menghemat bandwidth CPU->GPU
    if (lastUserImg !== userImg) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, userImg);
      lastUserImg = userImg;
    }
    gl.uniform1i(gl.getUniformLocation(shaderProgram!, "u_image"), 1);

    // Kirim UV crop transform ke shader
    const cropLocation = gl.getUniformLocation(shaderProgram!, "u_crop");
    gl.uniform4f(
      cropLocation, 
      crop.x / userImg.naturalWidth, 
      crop.y / userImg.naturalHeight, 
      crop.w / userImg.naturalWidth, 
      crop.h / userImg.naturalHeight
    );
  } else {
    gl.uniform1i(uHasImage, 0);
  }

  // Setup Attributes
  const positionLocation = gl.getAttribLocation(shaderProgram!, "a_position");
  gl.enableVertexAttribArray(positionLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const texCoordLocation = gl.getAttribLocation(shaderProgram!, "a_texCoord");
  gl.enableVertexAttribArray(texCoordLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

  // Render composite!
  gl.clearColor(0.0, 0.0, 0.0, 0.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}
