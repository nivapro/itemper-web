import Component from 'vue-class-component';
// Allow router hooks in vue @Component classes
Component.registerHooks([
    'beforeRouteEnter',
    'beforeRouteUpdate'
]);
