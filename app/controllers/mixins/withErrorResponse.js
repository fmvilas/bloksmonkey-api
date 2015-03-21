function respondWithError(err, res) {
  var res_info = {
    status: err.status || 500,
    message: err.message || 'Unexpected Error'
  };

  if( err.errors ) { res_info.errors = err.errors; }
  if( err.warnings ) { res_info.warnings = err.warnings; }

  res.status(res_info.status).json(res_info);
}

module.exports = {
  respondWithError: respondWithError
};
