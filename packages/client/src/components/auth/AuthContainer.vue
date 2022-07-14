<script setup>
defineProps({
  title: String,
  navText: String,
  navLinkText: String,
  navRoute: String
});
</script>

<template>
  <div class="row wrap flex-center form-wrapper">
    <div class="column col-xl-3 col-lg-4 col-md-5 col-sm-7 col-xs-12 text-center form-container">
      <div class="col-3 row flex-center">
        <h3 class="no-margin">{{ title }}</h3>
      </div>

      <div class="col-7 column justify-center">
        <slot />
      </div>

      <div class="col column flex-center">
        <p class="no-margin q-pb-sm">{{ navText }}</p>
        <RouterLink :to="{ name: navRoute }" class="link">{{ navLinkText }}</RouterLink>
      </div>
    </div>
  </div>
</template>

<style lang="sass" scoped>
.form-wrapper
    height: 100vh
    margin-top: -50px
.form-container
  padding: 50px
  background-color: $b3
  border-radius: 15px
  min-width: 390px
  max-width: 500px
  height: 600px
.link
  color: $teal-8
.link:hover
  filter: brightness(1.3)
.link:focus
  filter: brightness(2)
</style>
