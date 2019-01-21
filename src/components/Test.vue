<template>
  <div class="test">
    <div><b>{{ name }}</b></div>
    <div class="form">
      <label v-for="input in rInputs" :key="input.name" class="form-item">
        <div class="form-label">{{ input.name }}</div>
        <input v-if="input.type === 'text'" v-model="input.value">
      </label>
      <div class="form-item">
        <button @click="handleRun()">Run</button>
      </div>
    </div>
    <hr>
    <div class="form">
      <div v-for="res in rResults" :key="res.name" class="form-item">
        <div class="form-label">{{ res.label }}</div>
        <span class="light-color">{{ res.value }}</span>
      </div>
    </div>
  </div>
</template>

<script>
  import * as tools from '@/tools'

  export default {
    props: {
      name: String,
      inputs: Array,
      handle: Function,
      seed: String,
      salt: String
    },
    data () {
      return {
        defaultInputs: [
          {type: 'text', name: 'times', value: 1e4}
        ],
        results: []
      }
    },
    computed: {
      rInputs () {
        return this.defaultInputs.concat(this.inputs)
      },
      rResults () {
        let res = []
        for (let i in this.results) {
          res.push(Object.assign({
            name: i,
          }, this.results[i]))
        }
        return res 
      }
    },
    methods: {
      handleRun () {
        let params = this.rInputs.reduce((res, item) => (res[item.name] = item.value, res), {
          seed: this.seed,
          salt: this.salt
        })
        let doing = true
        let results = null
        let seed = this.seed
        let handle = this.handle.bind(params)
        for (let i = 0; i < params.times; i++) {
          let res = tools.getResult(seed, this.salt)
          results = handle(results, {
            index: i,
            res
          })
          seed = tools.getHash(seed)
        }
        this.results = results
      }
    }
  }
</script>

<style lang="scss">
  .light-color{
    color: #f66; font-weight: 700;
  }
</style>


