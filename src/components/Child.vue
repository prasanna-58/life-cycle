<template lang="html">
  <div>
    <h1>{{ title }}</h1>
     <p ref="dom">{{counter}}</p>
    <button @click="alterTitle()">Change title</button>
  </div>
</template>

<script>
/* eslint-disable */
export default {
  name: "Child",
  data() {
    return {
      title: "Old title",
      counter: 0
    };
  },
  methods: {
    alterTitle() {
      this.title = "Much improved title";
    }
  },
  beforeCreate() {
    alert("beforeCreate: before componet is created");
    // `this` points to the view model instance
    console.log("title is " + this.title); // title is undefined
  },
  created() {
    alert("created: component created but not yet added to DOM");
    // `this` points to the view model instance
    console.log("title is: " + this.title); // title is: 10

    // ----------------------------------------------- Before update & updated related------------------
    setInterval(() => {
      this.counter++;
    }, 1000);
    // --------------------------------------------------
  },
  beforeMount() {
    alert(
      "beforeMount: before component is mounted to the DOM but when it has been created"
    );

    // `this` points to the view model instance
    console.log(`this.$el is yet to be created`);
  },
  mounted() {
    alert(
      "mounted: after component is mounted to the DOM. This doesn't work for me"
    );
    console.log(this.$el.textContent); // I'm text inside the component.
  },
  beforeUpdate() {
    alert("beforeUpdate: before data is changed if it is about to change");
    console.log(this.counter); // Logs the counter value every second, before the DOM updates.
  },
  updated() {
    alert("updated: after data has been changed");
    console.log(+this.$refs["dom"].textContent === this.counter); // Logs true every second
  },
  beforeDestroy() {
    alert("beforeDestroy: before component is destroyed");
    this.title = null;
    delete this.title;
  },
  destroy() {
    alert("destroy: after component has been destroyed");
    this.$destroy();
    console.log(this);
  }
};
</script>

<style lang="css" scoped>
h1 {
  color: lightblue;
}
</style>
