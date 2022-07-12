<script setup>
const props = defineProps({
  type: String,
  label: String
});
</script>

<template>
  <div>
    <input :type="type" class="effect-16" placeholder="" />
    <label>{{ label }}</label>
    <span class="focus-border"></span>
  </div>
</template>

<style scoped>
input {
  color: white;
  width: 100%;
  box-sizing: border-box;
  letter-spacing: 1px;
}

:focus {
  outline: none;
}
.effect-16 {
  border: 0;
  padding: 4px 0;
  border-bottom: 1px solid #ccc;
  background-color: transparent;
}

.effect-16 ~ .focus-border {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #4caf50;
  transition: 0.4s;
}
.effect-16:focus ~ .focus-border,
.has-content.effect-16 ~ .focus-border {
  width: 100%;
  transition: 0.4s;
}
.effect-16 ~ label {
  position: absolute;
  left: 0;
  width: 100%;
  top: 9px;
  color: #aaa;
  transition: 0.3s;
  z-index: -1;
  letter-spacing: 0.5px;
}
.effect-16:focus ~ label,
.has-content.effect-16 ~ label {
  top: -16px;
  font-size: 12px;
  color: #4caf50;
  transition: 0.3s;
}
</style>
