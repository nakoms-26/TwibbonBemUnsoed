// webglChroma.ts

let glContext: WebGLRenderingContext | null = null;
let shaderProgram: WebGLProgram | null = null;
let positionBuffer: WebGLBuffer | null = null;
let texCoordBuffer: WebGLBuffer | null = null;
let videoTexture: WebGLTexture | null = null;
let imageTexture: WebGLTexture | null = null;
let lastUserImg: HTMLImageElement | null = null;

// Cached uniform & attrib locations — diisi sekali saat initWebGL()
// supaya renderChromaKey() tidak perlu GPU driver roundtrip tiap frame
let uVideo: WebGLUniformLocation | null = null;
let uKeyColor: WebGLUniformLocation | null = null;
let uSimilarity: WebGLUniformLocation | null = null;
let uSmoothness: WebGLUniformLocation | null = null;
let uHasImage: WebGLUniformLocation | null = null;
let uImage: WebGLUniformLocation | null = null;
let uCrop: WebGLUniformLocation | null = null;
let aPosition = -1;
let aTexCoord = -1;

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
  
  uniform vec3 u_keyColor;
  uniform float u_similarity;
  uniform float u_smoothness;
  
  void main() {
    vec4 vidColor = texture2D(u_video, v_texCoord);
    
    // YCbCr chroma distance — keying berbasis warna saja, tidak terpengaruh cahaya/bayangan
    float Cb1 = -0.1687 * vidColor.r - 0.3313 * vidColor.g + 0.5    * vidColor.b + 0.5;
    float Cr1 =  0.5    * vidColor.r - 0.4187 * vidColor.g - 0.0813 * vidColor.b + 0.5;

    float Cb2 = -0.1687 * u_keyColor.r - 0.3313 * u_keyColor.g + 0.5    * u_keyColor.b + 0.5;
    float Cr2 =  0.5    * u_keyColor.r - 0.4187 * u_keyColor.g - 0.0813 * u_keyColor.b + 0.5;
    
    float dist = distance(vec2(Cb1, Cr1), vec2(Cb2, Cr2));
    float alpha = smoothstep(u_similarity, u_similarity + u_smoothness, dist);

    // ── Spill Suppression ──────────────────────────────────────────────────
    // Di area tepi (semi-transparan), warna layar sering "bocor" ke subjek.
    // Teknik ini membatasi channel warna kunci agar tidak melebihi channel lain.
    float keyMax = max(u_keyColor.r, max(u_keyColor.g, u_keyColor.b));
    float spillAmount = clamp(1.0 - alpha, 0.0, 1.0);
    vec3 corrected = vidColor.rgb;

    if (u_keyColor.g >= keyMax) {
      // Green screen: batasi green agar tidak melebihi max(red, blue)
      corrected.g = mix(corrected.g, min(corrected.g, max(corrected.r, corrected.b)), spillAmount);
    } else if (u_keyColor.b >= keyMax) {
      // Blue screen: batasi blue
      corrected.b = mix(corrected.b, min(corrected.b, max(corrected.r, corrected.g)), spillAmount);
    } else {
      // Red screen: batasi red
      corrected.r = mix(corrected.r, min(corrected.r, max(corrected.g, corrected.b)), spillAmount);
    }
    // ──────────────────────────────────────────────────────────────────────

    if (u_hasImage) {
      vec2 imgUV = vec2(
        u_crop.x + v_texCoord.x * u_crop.z,
        u_crop.y + v_texCoord.y * u_crop.w
      );
      vec4 imgColor = texture2D(u_image, imgUV);
      vec3 finalColor = mix(imgColor.rgb, corrected, alpha);
      gl_FragColor = vec4(finalColor, 1.0);
    } else {
      gl_FragColor = vec4(corrected, alpha);
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

  // Cache semua uniform & attrib locations — SEKALI saja di sini
  uVideo      = gl.getUniformLocation(shaderProgram, "u_video");
  uKeyColor   = gl.getUniformLocation(shaderProgram, "u_keyColor");
  uSimilarity = gl.getUniformLocation(shaderProgram, "u_similarity");
  uSmoothness = gl.getUniformLocation(shaderProgram, "u_smoothness");
  uHasImage   = gl.getUniformLocation(shaderProgram, "u_hasImage");
  uImage      = gl.getUniformLocation(shaderProgram, "u_image");
  uCrop       = gl.getUniformLocation(shaderProgram, "u_crop");
  aPosition   = gl.getAttribLocation(shaderProgram, "a_position");
  aTexCoord   = gl.getAttribLocation(shaderProgram, "a_texCoord");

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

// Helper to convert hex to normalized RGB
function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return [0, 1, 0]; // Default green
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  return [r, g, b];
}

export function renderChromaKey(
  video: HTMLVideoElement, 
  canvas: HTMLCanvasElement,
  userImg?: HTMLImageElement,
  crop?: { x: number, y: number, w: number, h: number },
  chromaColorHex: string = "#00FF00"
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
  gl.uniform1i(uVideo, 0);

  // Set chroma key params (gunakan cached locations — tidak ada driver roundtrip)
  const [r, g, b] = hexToRgb(chromaColorHex);
  gl.uniform3f(uKeyColor, r, g, b);
  gl.uniform1f(uSimilarity, 0.15);
  gl.uniform1f(uSmoothness, 0.15);

  // Bind image to texture unit 1 (if provided)
  if (userImg && crop) {
    gl.uniform1i(uHasImage, 1);
    
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, imageTexture);
    if (lastUserImg !== userImg) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, userImg);
      lastUserImg = userImg;
    }
    gl.uniform1i(uImage, 1);
    gl.uniform4f(
      uCrop, 
      crop.x / userImg.naturalWidth, 
      crop.y / userImg.naturalHeight, 
      crop.w / userImg.naturalWidth, 
      crop.h / userImg.naturalHeight
    );
  } else {
    gl.uniform1i(uHasImage, 0);
  }

  // Setup Attributes (gunakan cached locations — tidak ada driver roundtrip)
  gl.enableVertexAttribArray(aPosition);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(aTexCoord);
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);

  // Render composite!
  gl.clearColor(0.0, 0.0, 0.0, 0.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

export function destroyWebGL() {
  if (glContext) {
    glContext.getExtension('WEBGL_lose_context')?.loseContext();
    glContext = null;
    shaderProgram = null;
    positionBuffer = null;
    texCoordBuffer = null;
    videoTexture = null;
    imageTexture = null;
    lastUserImg = null;
    // Reset cached locations juga
    uVideo = null; uKeyColor = null; uSimilarity = null;
    uSmoothness = null; uHasImage = null; uImage = null; uCrop = null;
    aPosition = -1; aTexCoord = -1;
  }
}
