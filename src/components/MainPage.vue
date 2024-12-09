<script>
import SideMenu from '@/components/SideMenu.vue';
export default {
  name: 'MainPage',
  components: {
    SideMenu,
  },
};
</script>

<template>
  <div class="flex flex-row gap-10 h-full">
    <SideMenu class="fixed-side-menu" />
    <div class="flex flex-1 mt-10 mr-10 ml-40">
      <RouterView />
    </div>
  </div>
</template>

<style>
.fixed-side-menu {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 200px; /* Adjust width as needed */
  z-index: 1000; /* Ensure it stays on top */
}
</style>
