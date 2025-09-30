module.exports = {
  setAuthToken(requestParams, context, ee, next) {
    // Simulate authentication - in real scenario, this would call your auth API
    const tokens = [
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test1',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test2',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test3',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test4',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test5'
    ];

    context.vars.authToken = tokens[Math.floor(Math.random() * tokens.length)];
    return next();
  }
};
