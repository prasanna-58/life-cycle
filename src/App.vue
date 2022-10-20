<template>
  <div id="app">
    <h1>Parent component</h1>
    <Child/>
  </div>
</template>

<script>
import Child from './components/Child'
export default {
  name: 'App',
  components: {
    Child
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #444;
  margin-top: 60px;
}
</style>
