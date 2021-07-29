<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { getTestAccount } from "@/models/exchanges";



export default {
  name: 'App',
  mounted() {
    this.setTestAccounts();
  },
  methods: {
    setTestAccounts() {
      const exchangeAccounts = getTestAccount();
      for (const exchangeId in exchangeAccounts) {
        if (exchangeAccounts.hasOwnProperty(exchangeId)) {
          const accounts = exchangeAccounts[exchangeId];
          if (!localStorage.getItem(exchangeId)) {
            localStorage.setItem(
              exchangeId,
              JSON.stringify(accounts)
            );
          }
        }
      }
    }
  }
}
</script>
