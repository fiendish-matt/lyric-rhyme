const express = require('express');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const app = express();
const port = process.env.PORT || 3000;

// Define a route for the cloaked affiliate links
app.get('/mashup', async (req, res) => {
  const originalUrl = 'https://redirecting7.eu/p/GebT/0Fj3/et6K/'; // Replace with your affiliate link
  const cloakedUrl = modifyAffiliateLink(originalUrl);

  try {
    // Create a virtual DOM using jsdom
    const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>');
    const window = dom.window;
    const document = window.document;

    // Add a script to perform the redirection
    const script = document.createElement('script');
    script.textContent = `window.location.replace("${encodeURI(cloakedUrl)}");`;
    document.body.appendChild(script);

    // Serialize the modified DOM
    const modifiedHtml = dom.serialize();

    // Send the modified HTML as the response
    res.send(modifiedHtml);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred.');
  }
});

// Modify the affiliate link as needed
function modifyAffiliateLink(originalUrl) {
  // Example: Adding an affiliate tracking parameter
  const affiliateTrackingCode = 'your_tracking_code';
  const modifiedUrl = `${originalUrl}?affiliate=${affiliateTrackingCode}`;
  return modifiedUrl;
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
