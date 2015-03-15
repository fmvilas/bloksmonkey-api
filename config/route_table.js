module.exports = {
  index: '/',
  root: '/api/v1',
  app: '/app',
  session: {
    login: '/login',
    logout: '/logout'
  },
  oauth2: {
    authorize: '/oauth2/authorize',
    decision: '/oauth2/authorize/decision',
    token: '/oauth2/access_token'
  },
  user: {
    single: '/users/:id',
    collection: '/users'
  },
  project: {
    single: '/projects/:id',
    collection: '/projects'
  },
  file: {
    content: '/projects/:project_id/files/:name/content',
    single: '/projects/:project_id/files/:name(*)',
    collection: '/projects/:project_id/files'
  }
};
