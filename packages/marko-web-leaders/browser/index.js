const LeadersProgram = () => import(/* webpackChunkName: "leaders-program" */ '@parameter1/base-cms-leaders-program');

export default (Browser) => {
  const { EventBus } = Browser;
  Browser.register('LeadersProgram', LeadersProgram, {
    withApollo: true,
    on: { action: (...args) => EventBus.$emit('leaders-action', ...args) },
  });
};
