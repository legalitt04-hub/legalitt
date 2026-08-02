// Vercel Serverless Proxy — forwards admin panel API calls to Render
// Intentionally does NOT forward the Origin header → bypasses Render CORS completely

const RENDER_BASE = 'https://legalitt-growth.onrender.com/api/v1';

module.exports = async (req, res) => {
  try {
    // Extract the path after /api/v1/
    const pathParts = req.query.path || [];
    const subPath = Array.isArray(pathParts) ? pathParts.join('/') : pathParts;

    // Preserve query string (e.g., ?page=1&limit=20)
    const urlObj = new URL(req.url, 'https://placeholder.com');
    // Remove the path params that vercel added, keep only real query params
    urlObj.searchParams.delete('path');
    const queryString = urlObj.search;

    const renderUrl = `${RENDER_BASE}/${subPath}${queryString}`;

    // Only forward safe headers — deliberately exclude Origin, Host, Referer
    const forwardHeaders = { 'Content-Type': 'application/json' };
    if (req.headers.authorization) {
      forwardHeaders['Authorization'] = req.headers.authorization;
    }

    // Read body for non-GET requests
    let body;
    if (!['GET', 'HEAD'].includes(req.method)) {
      body = JSON.stringify(req.body);
    }

    console.log(`[Proxy] ${req.method} ${renderUrl}`);

    const renderRes = await fetch(renderUrl, {
      method: req.method,
      headers: forwardHeaders,
      body,
    });

    // Allow CORS from the admin panel itself
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

    const data = await renderRes.json();
    return res.status(renderRes.status).json(data);

  } catch (err) {
    console.error('[Proxy Error]', err.message);
    return res.status(500).json({ success: false, message: 'Proxy error: ' + err.message });
  }
};
