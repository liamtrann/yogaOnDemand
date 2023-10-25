yoga-bar-on-demand

### Development MongoDB
```
mongodb+srv://root:xbdZrAfFmSPIZKTF@yoga-bar-development.8yblg.mongodb.net
root
xbdZrAfFmSPIZKTF
```
### Production MongoDB
```
mongodb+srv://root:xbdZrAfFmSPIZKTF@production.8yblg.mongodb.net
root
xbdZrAfFmSPIZKTF
```

### CORS on Google Cloud Buckets

You need to set the CORS on any Google Cloud Buckets to allow updating from the admin portal. I use the following.
```json
[
    {
      "origin": ["*"],
      "responseHeader": [
        "Content-Type",
        "Access-Control-Allow-Origin",
        "X-Requested-With",
        "x-goog-resumable"],
      "method": ["OPTIONS", "PUT"],
      "maxAgeSeconds": 3600
    }
]
```

its easy to do using the google cloud editor to create the file. then upload via

`gsutil cors set ./cors.json gs://yoga-bar-video-sources-develop`

you can check after with

`gsutil cors get gs://yoga-bar-video-sources-develop`

which then should give you...

`[{"maxAgeSeconds": 3600, "method": ["OPTIONS", "PUT"], "origin": ["*"], "responseHeader": ["Content-Type", "Access-Control-Allow-Origin", "X-Requ
ested-With", "x-goog-resumable"]}]`

<!-- test new repository -->