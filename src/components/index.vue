<script setup lang="ts">

import Main from "@/components/main.vue";
import Header from "@/components/Header.vue";
import Aside from "@/components/Aside.vue";
import Footer from "@/components/Footer.vue";
</script>

<template>
  <div class="index">
    <Header></Header>
    <div class="main">
      <Aside></Aside>
      <Main></Main>
    </div>
    <Footer></Footer>
  </div>
</template>

<style>
*{
  padding: 0;
  margin: 0;
}
.index{
  height: 1000px;
  display: flex;
  flex-direction: column;
}
.main{
  display: flex;
  flex: 5;
}
</style>