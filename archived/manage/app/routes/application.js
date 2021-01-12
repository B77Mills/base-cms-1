import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import LoadingMixin from '@parameter1/base-cms-manage/mixins/loading-mixin';

export default Route.extend(LoadingMixin, {
  errorNotifier: inject(),

  actions: {
    /**
     *
     * @param {*} transition
     */
    loading(transition) {
      this.showLoading();
      transition.finally(() => this.hideLoading());
    },

    /**
     *
     * @param {Error} e
     */
    error(e) {
      const notifier = this.get('errorNotifier');
      if (notifier.isReady()) {
        notifier.show(e);
      } else {
        this.intermediateTransitionTo('application_error', e);
      }
    },
  },
});
