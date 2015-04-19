module.exports = {
  index: '/',
  root: '/api/v1',
  app: '/app',
  account: {
    new: '/signup',
    send_email: '/signup/send_email',
    confirm_email: '/signup/confirm_email',
    forgot_password: '/forgot_password',
    reset_password: '/reset_password'
  },
  session: {
    login: '/login',
    logout: '/logout'
  },
  preview: {
    index: '/preview',
    login: '/preview/login',
    logout: '/preview/logout',
    signup: '/preview/signup',
    signup_email_sent: '/preview/signup_email_sent',
    confirmed_email: '/preview/confirmed_email',
    confirm_email_error: '/preview/confirm_email_error',
    forgot_password: '/preview/forgot_password',
    forgot_password_email_sent: '/preview/forgot_password_email_sent',
    forgot_password_email_error: '/preview/forgot_password_email_error',
    reset_password: '/preview/reset_password',
    reset_password_bad_token: '/preview/reset_password_bad_token',
    reset_password_sucess: '/preview/reset_password_sucess',
    not_found: '/preview/not_found',
    unexpected_error: '/preview/unexpected_error',
    allow_plugin: '/preview/allow_plugin'
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
