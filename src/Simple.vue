<template>
  <div id="simple">
    <div class="controls form">
      <div class="form-item"><label class="form-label">Seed</label><input placeholder="Seed" v-model="seed"></div>
      <div class="form-item"><label class="form-label">Slat</label><input placeholder="Slat" v-model="salt"></div>
      <div class="form-item"><label class="form-label">Sample</label><input placeholder="Sample" v-model.number="sample"></div>
      <div class="form-item"><label class="form-label">Area</label><input placeholder="Area" :value="areas" @input="handleAreaChange"></div>
      <div class="form-item">
        <button @click="handleCreate">Create</button>
      </div>
    </div>
    <div class="rsults">
      <table v-if="!loading && rates.length > 0">
        <tr><th></th><th v-for="(th, index) in areas" :key="th">[{{ `${areas[index-1] || 1}, ${th}` }})</th></tr>
        <tr><td>Quantity</td><td v-for="(td, index) in counts" :key="index">{{ td }}</td></tr>
        <tr><td>Probability</td><td v-for="(td, index) in counts" :key="index">{{ (100*td/sample).toFixed(2) }} %</td></tr>
        <tr><td>Theory Probability</td><td v-for="(td, index) in theory" :key="index">{{ td }} %</td></tr>
        <tr>
          <td>2x Continuity</td>
          <td colspan="6">
            <table>
              <tr><td>Time</td><td v-for="(item, index) in continuity2.slice(5)" :key="index">{{ index+1+5 }}</td></tr>
              <tr><td>Result</td><td v-for="item in continuity2.slice(5)" :key="item">{{ item }}</td></tr>
              <tr><td>Theory</td><td v-for="(item, index) in continuity2.slice(5)" :key="index">{{ Math.round(Math.pow(1-1/(2*1.01), index+1+5)*sample) }}</td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td colspan="7">
            <button v-if="!hashLink" @click="handleExportHash">Export Hash</button>
            <a v-else :download="hashLink.fileName" :href="hashLink.href">Download</a>
            <button v-if="!rateLink" @click="handleExportRate">Export Rate</button>
            <a v-else :download="rateLink.fileName" :href="rateLink.href">Download</a>
            <button v-if="!hashRateLink" @click="handleExportHashRate">Export Hash&Rate</button>
            <a v-else :download="hashRateLink.fileName" :href="hashRateLink.href">Download</a>
          </td>
        </tr>
      </table>
      <div v-else-if="loading" class="loading">Loading...</div>
      <div v-else class="nodata">No Data</div>
    </div>
  </div>
</template>

<script>
  import * as tools from '@/tools'

  export default {
    data () {
      return {
        seed: '184c77693d46dc7edf57b4748a3baafee7719d5a64c715486c071cf782fe90a8',
        salt: '',
        sample: 1e4,
        areas: [2, 5, 10, 50, 100, Infinity],
        expect: ['50.57', '29.7', '9', '7', '0.987', '0.99'],
        theory: [50.495, 29.702, 9.9, 7.92, 0.99, 0.99],
        hashLink: null,
        rateLink: null,
        hashRateLink: null,
        loading: false,
        hashs: [],
        rates: [],
        counts: [],
        stepMas: [],
        continuity2: []
      }
    },
    methods: {
      handleCreate () {
        this.loading = true
        this.clear()
        setTimeout(() => {
          let seed = this.seed
          let salt = this.salt
          let hashs = [], rates = []
          let lastI = -1
          let lastSteps = this.areas.map(() => 0)
          let stepMas = this.areas.map(() => 0)
          let counts = this.areas.map(() => 0)
          let continuity2 = [0]

          for (let index=1; index<=this.sample; index++) {
            let rate = tools.getResult(seed, salt)
            let i = this.areas.findIndex(item => rate < item)
            counts[i]++
            let step = index - lastSteps[i]
            lastSteps[i] = index
            hashs.push(seed)
            rates.push(rate)
            seed = tools.getHash(seed)
            if (i === lastI) {
              continuity2[0]++
              for (let j=5,l=continuity2[0];j<=l;j++) {
                continuity2[j] = (continuity2[j] || 0) + 1
              }
            } else {
              lastI = i
              continuity2[0] = 0
            }
          }

          Object.assign(this, {
            hashs,
            rates,
            counts,
            stepMas,
            continuity2
          })
          this.loading = false
          // this.seed = tools.getHmacHash(seed, salt)
        }, 200)
      },
      clear () {
        this.hashLink = null
        this.rateLink = null
        this.hashRateLink = null
      },
      handleAreaChange (e) {
        this.areas = e.target.value.split(',').map(item => Number(item))
      },
      handleExportHash () {
        this.hashLink = tools.downloadFile ('hash.csv', this.hashs.join('\n'))
      },
      handleExportRate () {
        this.rateLink = tools.downloadFile ('rate.csv', this.rates.join('\n'))
      },
      handleExportHashRate () {
        let content = ''
        for (let i=0; i<this.sample; i++) {
          content += `${this.hashs[i]},${this.rates[i]}\n`
        }
        this.hashRateLink = tools.downloadFile ('hash&rate.csv', content)
      }
    }
  }
</script>

<style lang="scss">
  #simple{
    font-size: 14px;
  }
  table{
    width: 100%; text-align: center;
    border-collapse: collapse;
    td{
      border: 1px solid #000;
      padding: 2px 4px;
    }
  }
  .form{
    &-item{
      display: inline-block; width: 200px;
      position: relative; margin: 10px 0; padding-left: 5em;
      text-align: left;
    }
    &-label{
      position: absolute; left: 0; top: 0; box-sizing: border-box;
      width: 5em; text-align: right; display: inline-block;
      padding-right: 0.5em;
    }
    input{
      padding: 2px; width: 100%; box-sizing: border-box;
    }
  }
  .rsults{
    margin-top: 10px; padding-top: 10px; border-top: 1px solid #000; 
    a, button{
      display: inline-block; box-sizing: border-box; height: 30px; line-height: 30px;
      margin: 0 10px; vertical-align: top;
      text-decoration: none; cursor: pointer;
      padding: 0 10px; border-radius: 3px;
      background-color: transparent;
    }
    button{
      color: #66f; border: 1px solid #66f;
    }
    a{
      color: #f66; border: 1px solid #f66;
    }
  }
  .nodata, .loading{
    padding: 50px; text-align: center;
  }
</style>
