import hex from 'crypto-js/enc-hex'
import sha256 from 'crypto-js/sha256'
import hmacSHA256 from 'crypto-js/hmac-sha256'

const getResult = (hash, salt) => {
  hash = String(hmacSHA256(hex.parse(hash), salt))
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

const getHash = (seed) => {
  return String(sha256(seed))
}

const start = (seed, salt, area, areaTotal) => {
  let opt = {
    running: true,
    area
  }
  let _t = 1
  setTimeout(() => {
    let index = 1
    let hashs = []
    let rates = []
    let counts = []
    let steps = []
    let lastSteps = []
    let list = []
    let hash = seed
    for(let i = 1; i< 11; i++) {
      list.push(Math.pow(2, i))
      counts.push(0)
      steps.push(0)
      lastSteps.push(0)
    }
    while (opt.running && _t <= areaTotal) {
      _t++
      let rate = getResult(hash, salt)
      hashs.push(hash)
      rates.push(rate)
      index++
      let i = list.findIndex(item => rate < item)
      if (i === -1) {
        i = list.length-1
      }
      counts[i]++
      let step = index - lastSteps[i]
      lastSteps[i] = index
      steps[i] = steps[i]*(counts[i]-1)/counts[i]+step/counts[i]

      if (index > area) {
        postMessage({
          type: 'progress',
          data: {
            counts,
            hashs,
            rates,
            steps,
            area
          }
        })
        index = 1
        hashs = []
        rates = []
        steps = list.map(() => 0)
        lastSteps = list.map(() => 0)
        counts = list.map(() => 0)
      }
      hash = getHash(hash)
    }
  })
  return opt
}








let opt = null
onmessage = ({data}) => {
  switch (data.type) {
    case 'start':
      if (opt) {
        opt.running = false
      }
      opt = start(data.data.seed, data.data.salt, data.data.area, data.data.areaTotal)
      break;
  
    case 'stop':
      if (opt) {
        opt.running = false
      }
      break;

    default:
      break;
  }
}