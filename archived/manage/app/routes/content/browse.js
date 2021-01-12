import Route from '@ember/routing/route';
import RouteObservableMixin from '@parameter1/base-cms-manage/mixins/route-observable-mixin';

import query from '@parameter1/base-cms-manage/gql/queries/content/browse';

export default Route.extend(RouteObservableMixin, {
  queryParams: {
    attribution: {
      refreshModel: false,
    },
    'content-types': {
      refreshModel: true,
    },
    'sort-by': {
      refreshModel: true,
    },
    'sort-direction': {
      refreshModel: true,
    },
  },

  /**
   *
   * @param {object} params
   */
  async model() {
    const input = {
      sort: { field: 'updated', order: 'desc' },
      pagination: { limit: 24 },
      status: 'any',
    };
    const variables = { input };
    const response = await this.get('apollo').watchQuery({ query, variables, fetchPolicy: 'network-only' }, 'allContent');
    this.getController().set('observable', this.getObservable(response));
    return response;
  },
});
