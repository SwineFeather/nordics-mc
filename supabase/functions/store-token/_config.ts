export const config = {
  // Make this function publicly accessible (no auth required)
  auth: false,
  // Allow all origins for CORS
  cors: {
    origin: '*',
    methods: ['POST', 'OPTIONS', 'GET'],
    allowedHeaders: ['authorization', 'x-client-info', 'apikey', 'content-type'],
    credentials: false
  }
};
