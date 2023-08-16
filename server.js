const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
const authRoutes = require("./route");


require("dotenv").config();


const app = express();

const router = express.Router();

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cors({ origin: process.env.CLIENT_URL }));

app.use("/api",router);

const targetUrls = {
  type25: "https://ad.admitad.com/g/cbvmqmmirj56bc9a2c7845f1c03a4a/",
  splinter: "https://redirecting7.eu/p/GebT/0Fj3/et6K",
};

app.use((req, res, next) => {
  if (req.query.id === undefined && req.query.info === undefined) {
    res.sendStatus(400);
    return;
  }
  const targetUrl = targetUrls[req.query.id];
  const targetUrlv2 = targetUrls[req.query.info];

  let response;

  if (targetUrl || targetUrlv2) {
    try {
      response = fetch(targetUrl || targetUrlv2, {
        method: "GET",
      });
      response.then((resp) => {
        if (resp.url) {
          createProxyMiddleware({
            target: resp.url,
            changeOrigin: true,
            selfHandleResponse: true,
            onProxyRes: async (proxyRes, req, res) => {
              const finalUrl = proxyRes.headers["location"] || resp.url;

              if(targetUrl){
                  res.set("Location", finalUrl);
                  res.setHeader("Location", finalUrl);
                  res.setHeader("Cache-Control", "no-store"); // Prevent caching
                  res.setHeader("X-Frame-Options", "DENY");    // Set X-Frame-Options      
                  res.sendStatus(302).end(); // Send a redirect response
              }
              else if(targetUrlv2){
                const htmlResponse = `
                <!DOCTYPE html>
                <html>
                <head>
                <title>resource loading</title>
                </head>
                <body>
                 <a id="dynamic-link" href="${finalUrl}"></a>
                <script>
                    document.addEventListener('DOMContentLoaded', function() {
                    window.setTimeout(()=>{
                      window.location.assign("${finalUrl}")
                    },1000)
                    });
                </script>
                </body>
                </html>
              `; 
              res.send(htmlResponse);
              }
              return;
            },
          })(req, res, next);
        } else {
          next();
        }
      });
    } catch (error) {
      console.log("error", error);
      res.sendStatus(400);
    }
  } else {
    return res.status(400).json({
      error: "invalid url",
    });
  }
});



const port = process.env.PORT;

app.listen(port, () => {
  console.log(`running on port ${port}`);
});

