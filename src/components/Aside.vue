<template>
  <div class="aside">
    <ul class="menu">
      <li v-for="(menu,idx) in menuList" :key="idx">
        <div class="menu-title" @click="toggleMenu(idx)" :class="{active: activeIndex==idx|| (route.path === menu.path)}">
          <div class="left">
            <div class="icon"></div>
            <router-link :to="menu.path">{{ menu.name}}</router-link>
          </div>
          <i class="arrow" v-if="idx!=0"></i>
        </div>
        <ul class="submenu" v-if="menu.children.length>0" :class="{show: activeIndex==idx}">
          <li v-for="(secondMenu,index) in menu.children" :key="index">
            <router-link :to="secondMenu.path">{{ secondMenu.name}}</router-link>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import {onMounted, ref} from 'vue';
import {useRoute} from "vue-router";
import {permission} from "@/util/Permission.ts";
import {useUserStore} from "@/stores/user.ts";
const userstore = useUserStore();
const route=useRoute();
const toggleMenu = (idx: number) => {
  if (activeIndex.value == idx) {
    //判断点击时索引序号，点击与当前索引一致就收起，不一致则展开点击的索引序号
    activeIndex.value = -1;
  } else {
    activeIndex.value = idx;
  }
}
const activeIndex = ref(0)
const menuList = ref([
  // {id: 1111, name: '首页', url: '/dashboard', children: []},
  // {
  //   id: 2222, name: '账号管理', children: [{id: 22220, name: '用户管理', url: '/dashboard/user/userManage'}]
  // },
  // {
  //   id: 3333, name: '角色管理', children: [
  //     {id: 33330, name: '角色信息', url: '/dashboard/role/roleInfo'}
  //   ]
  // },
  // {
  //   id: 5555, name: '订单管理', children: [
  //     {id: 55550, name: '我的订单', url: ''}
  //   ]
  // },
  // {
  //   id: 6666, name: '发票管理', children: [
  //     {id: 66660, name: '发票查询', url: ''}
  //   ]
  // },
  // {
  //   id: 8888, name: '使用记录', children: [
  //     {id: 88880, name: '数据统计', url: ''},
  //     {id: 88881, name: '我的信息', url: ''},
  //     {id: 88882, name: '我的数据', url: ''}
  //   ]
  // }
])
onMounted(()=>{
  // const info=localStorage.getItem('info')
  // console.log('这是aside', JSON.parse(info))
  menuList.value=userstore.userInfo.menuTree;
})
</script>

<style scoped>
.aside {
  width: 260px;
  background: #fff;
  border-right: 1px solid #e5e6eb;
  height: 100vh;
}

li a {
  text-decoration: none;
  color: #999999;
}

.menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu > li {
  border-bottom: 1px solid #eee;
}

.menu-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  cursor: pointer;
  color: #333;
}

.menu-title.active {
  color: #1677ff;
}

.menu-title .left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon {
  width: 18px;
  height: 18px;
  background: #1677ff;
  border-radius: 3px;
  opacity: 0.85;
}

.menu-title:not(.active) .icon {
  background: #999;
  opacity: 0.6;
}

.arrow {
  border: solid #666;
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 4px;
  transform: rotate(45deg);
  transition: transform 0.2s;
}

.menu-title.active .arrow {
  transform: rotate(-135deg);
  border-color: #1677ff;
}

.submenu {
  list-style: none;
  padding-left: 32px;
  margin: 0;
  display: none;
  position: relative;
}

.submenu::before {
  content: "";
  position: absolute;
  left: 18px;
  top: 0;
  bottom: 0;
  border-left: 1px dotted #c0c4cc;
}

.submenu li {
  padding: 10px 0 10px 20px;
  color: #666;
  position: relative;
  cursor: pointer;
}

.submenu li::before {
  content: "";
  position: absolute;
  left: -2px;
  top: 50%;
  width: 12px;
  border-top: 1px dotted #c0c4cc;
}

.submenu li:hover {
  color: #1677ff;
}

.submenu.show {
  display: block;
}
</style>