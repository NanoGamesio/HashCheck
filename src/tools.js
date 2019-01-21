import hex from 'crypto-js/enc-hex'
import sha256 from 'crypto-js/sha256'
import hmacSHA256 from 'crypto-js/hmac-sha256'

export function getResult (hash, salt) {
  hash = getHmacHash(hash, salt)
  hash = hash.slice(0, 13);
  const r = parseInt(hash, 16);

  // 3. X = r / 2^52
  let X = r / Math.pow(16, 13); // uniformly distributed in [0; 1)

  // 4. X = 99 / (1-X)
  X = 99 / (1 - X);

  // 5. return max(trunc(X), 100)
  const result = Math.floor(X);
  return Math.max(1, result / 100);
}

export function getHash (seed) {
  return String(sha256(seed))
}

export function getHmacHash (seed, salt) {
  if (salt) {
    return String(hmacSHA256(hex.parse(seed), salt))
  } else {
    return getHash(seed);
  }
}

export function percent (num) {
  return (num*100).toFixed(2)
}

export function getX(hex){
  return 1/(1 - parseInt(hex, 10)/65536)
}

export function getHex(x) {
  return '0x' + Math.round(65536 * (1 - 1/x)).toString(16)
}

export function downloadFile (fileName, content){
  let blob = new Blob([content])
  let href = URL.createObjectURL(blob)
  return {
    fileName,
    href
  }
}

export function hashTest (seed, salt = '0000000000000000004d6ec16dafe9d8370958664c1dc422f452892264c59526', total = 1000) {
  let sum = 0, sqrSum = 0
  let M, D, S
  let xsum = 0, xsqrSum = 0
  let m, d, s
  let preSeed = seed
  for(let i=0; i<total; i++){
    preSeed = getHash(String(preSeed))
    let num = parseInt(preSeed.slice(0,5), 16)
    sum += num
    sqrSum += Math.pow(num, 2)
    let res = getResult(preSeed, salt)
    xsum += (res-1)
    xsqrSum += Math.pow((res-1), 2)
  }

  M = sum/total
  D = sqrSum/total - Math.pow(sum, 2)/Math.pow(total, 2)
  S = Math.sqrt(D)

  m = xsum/total
  d = xsqrSum/total - Math.pow(xsum, 2)/Math.pow(total, 2)
  s = Math.sqrt(d)

  return {
    seed,
    salt,
    M,
    X: M/S,
    S,
    m,
    s,
    x: m/s
  }
}