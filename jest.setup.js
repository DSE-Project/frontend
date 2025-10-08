// Polyfill fetch for Jest (browser-like API in Node test env)
import 'whatwg-fetch';

// Environment variable for your app
process.env.VITE_API_BASE_URL = 'http://localhost:3000';

const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
