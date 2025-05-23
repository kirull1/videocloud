mkdir -p ~/video-cloud/.postgresql && \
wget "https://storage.yandexcloud.net/cloud-certs/CA.pem" \
     --output-document ~/video-cloud/.postgresql/root.crt && \
chmod 0600 ~/video-cloud/.postgresql/root.crt

