/**
 * AudioWorklet processor untuk menangkap audio dari MediaElementSource
 * dan mengirimkannya ke main thread via MessagePort.
 *
 * Berjalan di AudioWorkletGlobalScope — dedicated audio thread yang terpisah
 * dari main thread, sehingga WebGL render loop tidak pernah terblok oleh
 * pemrosesan audio.
 *
 * Protocol:
 *   main → worklet : tidak ada (worklet langsung aktif saat connect)
 *   worklet → main : { left: Float32Array, right: Float32Array }
 *                    dikirim setiap 128 sample (default Web Audio quantum)
 *                    menggunakan Transferable (zero-copy, tidak ada alokasi baru)
 */
class AudioCaptureProcessor extends AudioWorkletProcessor {
  /**
   * Dipanggil oleh audio engine setiap render quantum (128 sample).
   * @param {Float32Array[][]} inputs  - [[leftChannel, rightChannel], ...]
   * @returns {boolean} true = tetap hidup
   */
  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0] || input[0].length === 0) return true;

    const left  = input[0];
    const right = input[1] ?? input[0]; // mono source → duplikasi ke kanan

    // .slice() membuat salinan yang bisa di-transfer (buffer asli read-only di worklet)
    const leftCopy  = left.slice();
    const rightCopy = right.slice();

    // Transfer ownership buffer ke main thread — zero-copy, tidak ada GC pressure
    this.port.postMessage(
      { left: leftCopy, right: rightCopy },
      [leftCopy.buffer, rightCopy.buffer]
    );

    return true; // jangan matikan processor
  }
}

registerProcessor('audio-capture-processor', AudioCaptureProcessor);
