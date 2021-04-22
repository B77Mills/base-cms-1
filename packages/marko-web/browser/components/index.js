const LoadMoreTrigger = () => import(/* webpackChunkName: "load-more-trigger" */ './load-more-trigger.vue');
const TriggerInViewEvent = () => import(/* webpackChunkName: "trigger-in-view-event" */ './trigger-in-view-event.vue');
const TriggerScreenChangeEvent = () => import(/* webpackChunkName: "trigger-screen-change-event" */ './trigger-screen-change-event.vue');
const OEmbed = () => import(/* webpackChunkName: "oembed" */ './oembed.vue');
const FormDotComGatedDownload = () => import(/* webpackChunkName: "form-dot-com" */ './gated-download/form-dot-com.vue');
const WufooGatedDownload = () => import(/* webpackChunkName: "wufoo-gated-download" */ './gated-download/wufoo.vue');

export default (Browser) => {
  Browser.register('LoadMoreTrigger', LoadMoreTrigger);
  Browser.register('TriggerInViewEvent', TriggerInViewEvent);
  Browser.register('TriggerScreenChangeEvent', TriggerScreenChangeEvent);
  Browser.register('OEmbed', OEmbed);
  Browser.register('FormDotComGatedDownload', FormDotComGatedDownload);
  Browser.register('WufooGatedDownload', WufooGatedDownload);
};
