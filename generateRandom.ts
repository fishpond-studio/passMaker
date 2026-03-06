function assertNonNegativeInt(value: number, name: string): void {
  // 判断一个数是否为非零整数 若不是 throw Error
  if (typeof value !== 'number' || !isFinite(value) || Math.floor(value) !== value || value < 0) {
    throw new Error(`[Internal Logic Error]: ${name} must be a non-negative integer, but received ${value}`);
  }
}

// 浏览器环境检查
const cryptoObj = (() => {
  if (typeof window !== 'undefined' && window.crypto) return window.crypto;
  if (typeof globalThis !== 'undefined' && globalThis.crypto) return globalThis.crypto;
  if (typeof self !== 'undefined' && self.crypto) return self.crypto;
  return null;
})();

function generateRandom(length: number, min: number, max: number): number[] {
  assertNonNegativeInt(length, 'length');
  assertNonNegativeInt(min, 'min');
  assertNonNegativeInt(max, 'max');

  const range = max - min + 1;
  if (range <= 0) {
    throw new Error(`[Internal Logic Error]: min (${min}) cannot be greater than max (${max})`);
  }

  const result: number[] = new Array(length);

  // cryptoObj 为空时 使用降级算法 并提示不安全
  // Math.random
  if (!cryptoObj) {
    console.warn("PASSWORD UNSAFE! Using insecure random number generation");
    for (let i = 0; i < length; i++) {
      result[i] = Math.floor(Math.random() * range + min);
    }
    return result;
  }

  // crypto
  const maxUint32 = 4294967296;
  const limit = maxUint32 - (maxUint32 % range);
  const MAX_CHUNK_SIZE = 16384; // Web Crypto API 配额限制 16384 Uint32
  const singleRollBuffer = new Uint32Array(1); // 复用缓冲区

  let generated = 0;

  while (generated < length) {
    const chunkSize = Math.min(MAX_CHUNK_SIZE, length - generated);
    // 每次分配一个大块内存，大幅减少对象创建数量
    const buffer = new Uint32Array(chunkSize);

    // 一次性获取批量随机数
    cryptoObj.getRandomValues(buffer);

    for (let i = 0; i < chunkSize; i++) {
      let randomNumber = buffer[i];
      // 处理模偏差 (Modulo Bias)
      while (randomNumber >= limit) {
        cryptoObj.getRandomValues(singleRollBuffer);
        randomNumber = singleRollBuffer[0];
      }

      result[generated++] = (randomNumber % range) + min;
    }
  }

  return result;
}