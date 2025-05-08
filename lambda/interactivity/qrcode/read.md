
inside the cmd/bash terminal(change the api link (can't commit it) + url)
curl https://your-rest-api-id.execute-api.region.amazonaws.com/qrcode?url=https://your-url.com --output qr.png



run this inside the lambda function (change the url)
{
  "queryStringParameters": {
    "url": ""
  }
}

this is to test the qr image in console (you can through lambda)

The qr code is saved in an s3 bucket called qrCodeBucket